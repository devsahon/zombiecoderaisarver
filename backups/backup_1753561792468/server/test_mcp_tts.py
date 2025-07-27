import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'ai/server/mcp')))
from dispatcher import run_agent
from gtts import gTTS

# প্রশ্নের লিস্ট
questions = [
    "তুমি কে?",
    "বাংলাদেশের রাজধানী কোথায়?",
    "Python দিয়ে ওয়েব ডেভেলপমেন্ট কীভাবে করা যায়?"
]

# আউটপুট ফোল্ডার
output_dir = 'audio_outputs'
os.makedirs(output_dir, exist_ok=True)

for idx, question in enumerate(questions, 1):
    agent_type = "instruct"
    response = run_agent(agent_type, prompt=question, model=None)
    text = response["result"] if isinstance(response, dict) else str(response)
    print(f"Q{idx}: {question}\nAI: {text}")
    # ফাইলনেম: টাইমস্ট্যাম্প ও সিরিয়াল
    filename = f"answer_{idx}_{int(time.time())}.mp3"
    filepath = os.path.join(output_dir, filename)
    tts = gTTS(text=text, lang='bn')
    tts.save(filepath)
    print(f"Saved audio: {filepath}\n") 