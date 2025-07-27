import requests
import tempfile
import os
import time

def ask_and_play(message, lang='bn'):
    url = 'http://127.0.0.1:5000/api/chat'
    data = {'message': message, 'language': lang}
    resp = requests.post(url, json=data)
    print(f'Q: {message}')
    print('Status:', resp.status_code)
    print('Response:', resp.text)
    if resp.status_code == 200 and resp.json().get('success'):
        reply = resp.json().get('response')
        print('AI Reply:', reply)
        tts_url = 'http://127.0.0.1:5000/api/tts'
        tts_resp = requests.post(tts_url, json={'text': reply, 'lang': lang})
        if tts_resp.status_code == 200:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as fp:
                fp.write(tts_resp.content)
                fp.flush()
                print('Playing audio:', fp.name)
                os.startfile(fp.name)
                time.sleep(5)
        else:
            print('TTS failed:', tts_resp.text)
    else:
        print('Chat API failed.')

# Test girlfriend-gpt
ask_and_play('@him তুমি কি আমাকে ভালোবাসো?')
# Test normal MCP
ask_and_play('বাংলাদেশের রাজধানী কোথায়?') 