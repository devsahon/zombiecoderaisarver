from flask import Flask, request, jsonify, send_file
import yaml
import json
import os
import time
import threading
from typing import Dict, Optional
import pyttsx3
import tempfile
from gtts import gTTS
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../agents')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ai/utils')))
from utils import load_agent_config, generate_prompt
from blog_writer_bn import generate_blog
from helpers import load_yaml_config
from .fallback_router import get_fallback_model

# Load tool registry
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), '../config/registry.json')
with open(REGISTRY_PATH, encoding='utf-8') as f:
    TOOL_REGISTRY = json.load(f)

# Provider loader
PROVIDERS_BASE = os.path.join(os.path.dirname(__file__), '../config/providers')

def load_provider_module(provider_id):
    provider_dir = os.path.join(PROVIDERS_BASE, provider_id)
    provider_py = os.path.join(provider_dir, 'provider.py')
    if not os.path.exists(provider_py):
        raise ImportError(f"Provider module not found: {provider_py}")
    spec = importlib.util.spec_from_file_location(f"provider_{provider_id}", provider_py)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def run_tool_with_fallback(tool_name, input_text):
    providers = TOOL_REGISTRY.get(tool_name, [])
    for provider_id in providers:
        try:
            provider = load_provider_module(provider_id)
            return provider.run(input_text)
        except Exception as e:
            print(f"[Fallback Warning] {provider_id} failed: {e}")
    return {"error": f"❌ সব fallback provider ব্যর্থ হয়েছে: {tool_name}"}

def instruct_agent(prompt, model=None, **kwargs):
    return {"result": f"[Instruct] {prompt} (model: {model})"}

def run_agent(task_type, **kwargs):
    if task_type == "blog_writer_bn":
        return {"result": generate_blog(**kwargs), "agent_type": "blog_writer_bn"}
    if task_type == "instruct":
        return {"result": instruct_agent(**kwargs)["result"], "agent_type": "instruct"}
    if task_type == "girlfriend-gpt":
        prompt = kwargs.get('prompt', '')
        msg = prompt.lower()
        if "ভালোবাস" in msg or "love" in msg:
            reply = "আমি তো তোমাকে খুব ভালোবাসি! তুমি কেমন আছো?"
        elif "help" in msg or "সহায়তা" in msg:
            reply = "তুমি কী নিয়ে চিন্তিত? আমি তোমার পাশে আছি!"
        else:
            reply = f"তুমি বলো, '{prompt}'—আমি শুনছি!"
        return {"result": reply, "agent_type": "girlfriend-gpt"}
    if task_type == "sms_reply":
        from ai.agents.sms_reply_agent import SMSReplyAgent
        agent = SMSReplyAgent()
        prompt = kwargs.get('prompt', '')
        reply = agent.process(prompt)
        return {"result": reply['result'], "agent_type": "sms_reply"}
    if task_type == "mcp":
        prompt = kwargs.get('prompt', '')
        msg = prompt.lower()
        # Contextual answer for Laravel/Spatie permission error
        if (
            "spatie" in msg or "permission" in msg or "role" in msg or "unauthorizedexception" in msg or
            "user does not have the right roles" in msg
        ):
            return {
                "result": (
                    "আপনার error: 'User does not have the right roles...' মানে ইউজারের কাছে প্রয়োজনীয় role/permission নেই। "
                    "সমাধান:\n"
                    "১. ইউজারকে প্রয়োজনীয় role/permission অ্যাসাইন করুন (assignRole/givePermissionTo)।\n"
                    "২. কোডে role/permission চেক করুন (hasRole/can)।\n"
                    "৩. ডাটাবেস ও config/permission.php ফাইল চেক করুন।\n"
                    "৪. Seeder দিয়ে role/permission তৈরি করুন।\n"
                    "আরো নির্দিষ্ট error বা কোড দিলে আরও বিস্তারিত সাহায্য করতে পারব।"
                ),
                "agent_type": "mcp-contextual"
            }
        # Fallback to agent selection
        from ai.agents.registry import AgentRegistry
        try:
            if any(word in prompt.lower() for word in ["কোড", "code", "python", "bug", "debug"]):
                agent = AgentRegistry.get_agent("procoder")
                agent_type = "procoder"
            elif any(word in prompt.lower() for word in ["ব্লগ", "blog", "লিখ", "write"]):
                agent = AgentRegistry.get_agent("blog_writer_bn")
                agent_type = "blog_writer_bn"
            else:
                agent = AgentRegistry.get_agent("creative_writer")
                agent_type = "creative_writer"
            reply = agent.process_message(prompt)
            return {"result": reply, "agent_type": agent_type}
        except Exception as e:
            return {"result": f"[ERROR] {str(e)}", "agent_type": "error"}
    # fallback
    return {"result": "Sorry, I could not process your request.", "agent_type": "unknown"}

def run_task_with_fallback(task_type, user_input):
    config = load_yaml_config("blog_writer_bn")
    try:
        return run_agent(task_type, prompt=user_input, model=config["primary"])
    except Exception:
        fallback_model = get_fallback_model(config)
        return run_agent(task_type, prompt=user_input, model=fallback_model)

# Example usage (for test)
if __name__ == "__main__":
    from flask import Flask
    app = Flask(__name__)
    @app.route("/status")
    def status():
        return {"status": "MCP Dispatcher running"}
    app.run(host="0.0.0.0", port=19543) 