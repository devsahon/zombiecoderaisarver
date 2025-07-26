import os
import json
 
def fallback_router(request, error=None):
    # Minimal fallback response
    return {'status': 'fallback', 'error': error, 'message': 'All providers failed.'} 