"""Favorites routes using Supabase."""

from flask import request, jsonify, session
from . import favorites_bp
from ..extensions import supabase


def _require_login():
    user_id = session.get('user_id')
    if not user_id:
        return None, (jsonify({'error': 'Login required'}), 401)
    return user_id, None


@favorites_bp.route('', methods=['GET'])
def list_favorites():
    """List all favorites for the logged-in user."""
    user_id, error = _require_login()
    if error:
        return error

    result = supabase.table('favorites').select('*').eq('user_id', user_id)\
        .order('saved_at', desc=True).execute()
    return jsonify({'favorites': result.data}), 200


@favorites_bp.route('', methods=['POST'])
def add_favorite():
    """Add a recipe to favorites."""
    user_id, error = _require_login()
    if error:
        return error

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    recipe_id = data.get('recipe_id')
    recipe_title = data.get('recipe_title', '')
    recipe_image = data.get('recipe_image', '')

    if not recipe_id:
        return jsonify({'error': 'recipe_id is required'}), 400

    # Check for duplicate
    existing = supabase.table('favorites').select('id')\
        .eq('user_id', user_id).eq('recipe_id', recipe_id).execute()
    if existing.data:
        return jsonify({'error': 'Recipe already in favorites', 'favorite': existing.data[0]}), 409

    result = supabase.table('favorites').insert({
        'user_id': user_id,
        'recipe_id': recipe_id,
        'recipe_title': recipe_title,
        'recipe_image': recipe_image
    }).execute()

    return jsonify({'message': 'Added to favorites', 'favorite': result.data[0]}), 201


@favorites_bp.route('/<int:recipe_id>', methods=['DELETE'])
def remove_favorite(recipe_id):
    """Remove a recipe from favorites."""
    user_id, error = _require_login()
    if error:
        return error

    existing = supabase.table('favorites').select('id')\
        .eq('user_id', user_id).eq('recipe_id', recipe_id).execute()
    if not existing.data:
        return jsonify({'error': 'Favorite not found'}), 404

    supabase.table('favorites').delete()\
        .eq('user_id', user_id).eq('recipe_id', recipe_id).execute()
    return jsonify({'message': 'Removed from favorites'}), 200


@favorites_bp.route('/check/<int:recipe_id>', methods=['GET'])
def check_favorite(recipe_id):
    """Check if a recipe is in the user's favorites."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'is_favorite': False}), 200

    result = supabase.table('favorites').select('id')\
        .eq('user_id', user_id).eq('recipe_id', recipe_id).execute()
    return jsonify({'is_favorite': len(result.data) > 0}), 200
