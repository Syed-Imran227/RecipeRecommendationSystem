"""Search history routes using Supabase."""

import json
from flask import jsonify, session
from . import history_bp
from ..extensions import supabase


@history_bp.route('', methods=['GET'])
def list_history():
    """List search history for the logged-in user."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Login required'}), 401

    result = supabase.table('search_history').select('*')\
        .eq('user_id', user_id).order('searched_at', desc=True).limit(50).execute()
    return jsonify({'history': result.data}), 200


@history_bp.route('', methods=['DELETE'])
def clear_history():
    """Clear all search history for the logged-in user."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Login required'}), 401

    supabase.table('search_history').delete().eq('user_id', user_id).execute()
    return jsonify({'message': 'Search history cleared'}), 200
