from dotenv import load_dotenv
import os

if not os.path.exists('.env'):
    with open('.env', 'w') as f:
        f.write("TOGETHER_API_KEY=your_key_here\n")
        f.write("OPENAI_API_KEY=your_key_here\n")
    print("✅ .env created. Please update it with your real API keys.")
else:
    print("✅ .env already exists.") 