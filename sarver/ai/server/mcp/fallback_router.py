def get_fallback_model(config):
    fallback_list = config.get("fallback", [])
    return fallback_list[0] if fallback_list else config.get("primary") 