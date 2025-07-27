import os
import json
from dispatcher.fallback import fallback_router
from dispatcher.model_loader import load_provider
import datetime

AGENT_PROFILE_PATH = os.path.join(os.path.dirname(__file__), '../agents/profile_zombie.json')
LOG_ACTIVITY = os.path.join(os.path.dirname(__file__), '../logs/agent_activity.log')
LOG_FALLBACK = os.path.join(os.path.dirname(__file__), '../logs/fallback.log')
USAGE_LOG = os.path.join(os.path.dirname(__file__), '../logs/usage.log')

def log_event(logfile, data):
    os.makedirs(os.path.dirname(logfile), exist_ok=True)
    with open(logfile, 'a') as f:
        f.write(json.dumps(data, ensure_ascii=False) + '\n')

def log_usage(agent, provider, success):
    os.makedirs(os.path.dirname(USAGE_LOG), exist_ok=True)
    with open(USAGE_LOG, 'a') as f:
        f.write(f"{datetime.datetime.now().isoformat()}, {agent}, {provider}, {success}\n")

def load_agent_profile():
    with open(AGENT_PROFILE_PATH, 'r') as f:
        return json.load(f)

def dispatch(request):
    agent = load_agent_profile()
    providers = [agent['preferred_provider']] + agent.get('fallback_order', [])
    last_error = None
    for provider_name in providers:
        provider = load_provider(provider_name)
        try:
            result = provider.run(request)
            log_event(LOG_ACTIVITY, {'provider': provider_name, 'request': request, 'result': result})
            log_usage(agent['name'], provider_name, 'success')
            return result
        except Exception as e:
            last_error = str(e)
            log_event(LOG_FALLBACK, {'provider': provider_name, 'error': last_error, 'request': request})
            log_usage(agent['name'], provider_name, 'fail')
    log_usage(agent['name'], 'fallback', 'fail')
    return fallback_router(request, error=last_error)

if __name__ == '__main__':
    import sys
    req = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    print(json.dumps(dispatch(req))) 