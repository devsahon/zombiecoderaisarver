from dispatcher.local_model_checker import detect_installed_models
import importlib

# Explicit provider imports
import providers.openai as openai_provider
import providers.togetherai as togetherai_provider
import providers.local.ollama as ollama_provider

providers = {
    'openai': openai_provider,
    'together': togetherai_provider,
    'ollama': ollama_provider
}

def load_provider(name):
    installed_local = detect_installed_models()
    if name == 'ollama' and 'ollama' in installed_local:
        return providers['ollama']
    elif name == 'openai':
        return providers['openai']
    elif name == 'together':
        return providers['together']
    else:
        raise ImportError(f'Provider {name} not found or not installed') 