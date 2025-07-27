"""
Admin API - Handles admin panel features, feature list, and task management
"""
from flask import Blueprint, request, jsonify

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/feature', methods=['GET'])
def feature_list():
    pass

@admin_bp.route('/todo', methods=['POST'])
def add_todo():
    pass

@admin_bp.route('/todo', methods=['GET'])
def get_todos():
    pass 