"""
License API - REST endpoints for license management
"""
from flask import Blueprint, request, jsonify
from .manager import LicenseManager

license_bp = Blueprint('license', __name__)
license_manager = LicenseManager()

@license_bp.route('/verify', methods=['POST'])
def verify_license():
    """Verify license key endpoint"""
    pass
    
@license_bp.route('/activate', methods=['POST'])
def activate_license():
    """Activate license for device endpoint"""
    pass
    
@license_bp.route('/deactivate', methods=['POST'])
def deactivate_license():
    """Deactivate license endpoint"""
    pass
    
@license_bp.route('/status', methods=['GET'])
def license_status():
    """Get license status endpoint"""
    pass 