"""Recipe routes — all Spoonacular endpoints."""

from flask import request, jsonify, session
from . import recipes_bp
from ..extensions import supabase
from ..services import spoonacular_client as spoon


@recipes_bp.route('/search', methods=['POST'])
def search_recipes():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    ingredients  = data.get('ingredients', [])
    query        = data.get('query', '').strip()
    cuisine      = data.get('cuisine', '').strip()
    diet         = data.get('diet', '').strip()
    meal_type    = data.get('meal_type', '').strip()
    max_time     = data.get('max_ready_time')
    intolerances = data.get('intolerances', '').strip()   # Feature 3
    sort         = data.get('sort', '').strip()           # Feature 4
    sort_dir     = data.get('sort_direction', 'desc')
    number       = min(data.get('number', 12), 50)

    if not ingredients and not query:
        return jsonify({'error': 'Please enter ingredients or a search query'}), 400

    try:
        if ingredients:
            cleaned = [i.strip().lower() for i in ingredients if i.strip()]
            results = spoon.search_by_ingredients(cleaned, number=number)
            formatted = [spoon.format_recipe_card(r) for r in results]
            query_text = ', '.join(cleaned)
        else:
            data_resp = spoon.complex_search(
                query=query, cuisine=cuisine, diet=diet, meal_type=meal_type,
                max_ready_time=max_time, number=number,
                intolerances=intolerances, sort=sort, sort_direction=sort_dir
            )
            formatted = [spoon.format_recipe_card(r) for r in data_resp.get('results', [])]
            query_text = query

        user_id = session.get('user_id')
        if user_id:
            filters = {k: v for k, v in {
                'cuisine': cuisine, 'diet': diet, 'meal_type': meal_type,
                'max_ready_time': max_time, 'intolerances': intolerances, 'sort': sort
            }.items() if v}
            supabase.table('search_history').insert({
                'user_id': user_id, 'query_text': query_text,
                'filters_applied': filters, 'result_count': len(formatted)
            }).execute()

        return jsonify({'recipes': formatted, 'count': len(formatted)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch recipes: {str(e)}'}), 500


@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe_details(recipe_id):
    try:
        data = spoon.get_recipe_details(recipe_id)
        formatted = spoon.format_recipe_detail(data)
        return jsonify({'recipe': formatted}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch recipe: {str(e)}'}), 500


@recipes_bp.route('/random', methods=['GET'])
def get_random():
    tags   = request.args.get('tags', '')
    number = min(int(request.args.get('number', 12)), 50)
    try:
        data = spoon.get_random_recipes(number=number, tags=tags)
        formatted = [spoon.format_recipe_card(r) for r in data.get('recipes', [])]
        return jsonify({'recipes': formatted, 'count': len(formatted)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch recipes: {str(e)}'}), 500


# Feature 1 — Ingredient autocomplete
@recipes_bp.route('/autocomplete/ingredients', methods=['GET'])
def autocomplete_ingredients():
    query = request.args.get('query', '').strip()
    if not query or len(query) < 2:
        return jsonify({'suggestions': []}), 200
    try:
        results = spoon.autocomplete_ingredients(query)
        return jsonify({'suggestions': results}), 200
    except Exception:
        return jsonify({'suggestions': []}), 200


# Feature 8 — Recipe name autocomplete
@recipes_bp.route('/autocomplete/recipes', methods=['GET'])
def autocomplete_recipes():
    query = request.args.get('query', '').strip()
    if not query or len(query) < 2:
        return jsonify({'suggestions': []}), 200
    try:
        results = spoon.autocomplete_recipes(query)
        return jsonify({'suggestions': results}), 200
    except Exception:
        return jsonify({'suggestions': []}), 200


# Feature 5 — Nutrition info
@recipes_bp.route('/<int:recipe_id>/nutrition', methods=['GET'])
def get_nutrition(recipe_id):
    try:
        data = spoon.get_nutrition(recipe_id)
        return jsonify({'nutrition': data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Feature 6 — Similar recipes
@recipes_bp.route('/<int:recipe_id>/similar', methods=['GET'])
def get_similar(recipe_id):
    try:
        results = spoon.get_similar_recipes(recipe_id)
        return jsonify({'recipes': results}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Feature 7 — Nutrition label image URL
@recipes_bp.route('/<int:recipe_id>/nutrition-label-url', methods=['GET'])
def nutrition_label_url(recipe_id):
    url = spoon.get_nutrition_label_url(recipe_id)
    return jsonify({'url': url}), 200


# Feature 9 — Meal plan generator
@recipes_bp.route('/meal-plan', methods=['POST'])
def meal_plan():
    data = request.get_json() or {}
    calories   = data.get('calories', 2000)
    diet       = data.get('diet', '')
    exclude    = data.get('exclude', '')
    time_frame = data.get('time_frame', 'day')
    try:
        result = spoon.generate_meal_plan(
            target_calories=calories, diet=diet,
            exclude=exclude, time_frame=time_frame
        )
        return jsonify({'plan': result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Feature 11 — Ingredient substitutes
@recipes_bp.route('/substitutes', methods=['GET'])
def ingredient_substitutes():
    ingredient = request.args.get('ingredient', '').strip()
    if not ingredient:
        return jsonify({'error': 'ingredient param required'}), 400
    try:
        result = spoon.get_ingredient_substitutes(ingredient)
        return jsonify({'substitutes': result.get('substitutes', []),
                        'ingredient': result.get('ingredient', ingredient),
                        'message': result.get('message', '')}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Feature 12 — Extract recipe from URL
@recipes_bp.route('/extract', methods=['POST'])
def extract_recipe():
    data = request.get_json() or {}
    url = data.get('url', '').strip()
    if not url:
        return jsonify({'error': 'url is required'}), 400
    try:
        result = spoon.extract_recipe_from_url(url)
        formatted = spoon.format_recipe_detail(result)
        return jsonify({'recipe': formatted}), 200
    except Exception as e:
        return jsonify({'error': f'Could not extract recipe: {str(e)}'}), 500
