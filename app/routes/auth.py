"""Authentication routes using Supabase."""

from flask import request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from . import auth_bp
from ..extensions import supabase


@auth_bp.route('/register', methods=['POST'])
def register():
    """Create a new user account."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Check if email already exists
    existing = supabase.table('users').select('id').eq('email', email).execute()
    if existing.data:
        return jsonify({'error': 'Email already registered'}), 409

    # Create user
    password_hash = generate_password_hash(password)
    result = supabase.table('users').insert({
        'name': name,
        'email': email,
        'password_hash': password_hash
    }).execute()

    user = result.data[0]
    session['user_id'] = user['id']

    return jsonify({
        'message': 'Registration successful',
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    result = supabase.table('users').select('*').eq('email', email).execute()
    if not result.data:
        return jsonify({'error': 'Invalid email or password'}), 401

    user = result.data[0]
    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user['id']
    return jsonify({
        'message': 'Login successful',
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Clear user session."""
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get the currently logged-in user."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in', 'user': None}), 401

    result = supabase.table('users').select('id, name, email, created_at').eq('id', user_id).execute()
    if not result.data:
        session.pop('user_id', None)
        return jsonify({'error': 'User not found', 'user': None}), 401

    return jsonify({'user': result.data[0]}), 200
