def run(request):
    import subprocess
    prompt = request.get("prompt", "")
    cmd = f"ollama run llama3 \"{prompt}\""
    result = subprocess.getoutput(cmd)
    return {"response": result} 