"""Spoonacular API client for recipe data."""

import os
import requests

BASE_URL = "https://api.spoonacular.com"


def _get_api_key():
    key = os.environ.get('SPOONACULAR_API_KEY', '')
    if not key:
        raise ValueError("SPOONACULAR_API_KEY environment variable is not set")
    return key


def _make_request(endpoint, params=None, timeout=15):
    if params is None:
        params = {}
    params['apiKey'] = _get_api_key()
    response = requests.get(f"{BASE_URL}{endpoint}", params=params, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _make_post(endpoint, data=None):
    params = {'apiKey': _get_api_key()}
    response = requests.post(f"{BASE_URL}{endpoint}", params=params, json=data, timeout=15)
    response.raise_for_status()
    return response.json()


# ── Feature 1: Ingredient Autocomplete ─────────────────────────────────────
def autocomplete_ingredients(query, number=8):
    """Autocomplete ingredient names."""
    return _make_request('/food/ingredients/autocomplete', {
        'query': query, 'number': number, 'metaInformation': True
    })


# ── Feature 8: Recipe name autocomplete ────────────────────────────────────
def autocomplete_recipes(query, number=8):
    """Autocomplete recipe search suggestions."""
    return _make_request('/recipes/autocomplete', {
        'query': query, 'number': number
    })


# ── Features 2,3,4: Search by ingredients (with missed info) ───────────────
def search_by_ingredients(ingredients, number=12):
    """Search recipes by ingredients — returns usedIngredients/missedIngredients."""
    return _make_request('/recipes/findByIngredients', {
        'ingredients': ','.join(ingredients),
        'number': number,
        'ranking': 1,
        'ignorePantry': True
    })


# ── Features 3,4: Complex search with intolerances + sort ──────────────────
def complex_search(query='', cuisine='', diet='', meal_type='',
                   max_ready_time=None, number=12, offset=0,
                   intolerances='', sort='', sort_direction='desc'):
    """Search with full filter set including intolerances and sort."""
    params = {
        'number': number,
        'offset': offset,
        'addRecipeInformation': True,
        'fillIngredients': True,
        'instructionsRequired': True
    }
    if query:       params['query'] = query
    if cuisine:     params['cuisine'] = cuisine
    if diet:        params['diet'] = diet
    if meal_type:   params['type'] = meal_type
    if max_ready_time: params['maxReadyTime'] = max_ready_time
    if intolerances: params['intolerances'] = intolerances
    if sort:        params['sort'] = sort
    if sort:        params['sortDirection'] = sort_direction
    return _make_request('/recipes/complexSearch', params)


# ── Feature 5: Nutrition info ───────────────────────────────────────────────
def get_nutrition(recipe_id):
    """Get full nutrition data for a recipe."""
    return _make_request(f'/recipes/{recipe_id}/nutritionWidget.json')


# ── Base recipe detail ──────────────────────────────────────────────────────
def get_recipe_details(recipe_id):
    """Get full recipe information including nutrition."""
    return _make_request(f'/recipes/{recipe_id}/information', {
        'includeNutrition': True
    })


def get_recipe_instructions(recipe_id):
    return _make_request(f'/recipes/{recipe_id}/analyzedInstructions')


def get_random_recipes(number=12, tags=''):
    params = {'number': number}
    if tags:
        params['tags'] = tags
    return _make_request('/recipes/random', params)


# ── Feature 6: Similar recipes ─────────────────────────────────────────────
def get_similar_recipes(recipe_id, number=6):
    """Get recipes similar to a given recipe."""
    return _make_request(f'/recipes/{recipe_id}/similar', {'number': number})


# ── Feature 7: Nutrition label image URL (no API call needed) ──────────────
def get_nutrition_label_url(recipe_id):
    """Return the URL for the pre-built nutrition label widget image."""
    key = _get_api_key()
    return f"{BASE_URL}/recipes/{recipe_id}/nutritionLabel.png?apiKey={key}&showIngredients=false"


# ── Feature 9: Meal plan generator ─────────────────────────────────────────
def generate_meal_plan(target_calories=2000, diet='', exclude='', time_frame='day'):
    """Generate a meal plan for a day or week."""
    params = {
        'timeFrame': time_frame,
        'targetCalories': target_calories,
    }
    if diet:    params['diet'] = diet
    if exclude: params['exclude'] = exclude
    return _make_request('/mealplanner/generate', params, timeout=60)


# ── Feature 11: Ingredient substitutes ─────────────────────────────────────
def get_ingredient_substitutes(ingredient_name):
    """Get substitutes for a given ingredient by name."""
    return _make_request('/food/ingredients/substitutes', {
        'ingredientName': ingredient_name
    })


# ── Feature 12: Extract recipe from URL ────────────────────────────────────
def extract_recipe_from_url(url):
    """Extract recipe data from any external URL."""
    return _make_request('/recipes/extract', {
        'url': url,
        'forceExtraction': True,
        'analyze': True,
        'addRecipeInformation': True
    })


# ── Formatters ──────────────────────────────────────────────────────────────
def format_recipe_card(recipe_data):
    """Format raw Spoonacular data into simplified card format."""
    missed = recipe_data.get('missedIngredients', [])
    missed_list = [
        {
            'name': m.get('name', ''),
            'image': f"https://img.spoonacular.com/ingredients_100x100/{m.get('image','')}"
                     if m.get('image') else ''
        }
        for m in missed[:4]
    ]
    return {
        'id': recipe_data.get('id'),
        'title': recipe_data.get('title', ''),
        'image': recipe_data.get('image', ''),
        'readyInMinutes': recipe_data.get('readyInMinutes', 0),
        'servings': recipe_data.get('servings', 0),
        'cuisines': recipe_data.get('cuisines', []),
        'dishTypes': recipe_data.get('dishTypes', []),
        'diets': recipe_data.get('diets', []),
        'summary': recipe_data.get('summary', ''),
        'usedIngredientCount': recipe_data.get('usedIngredientCount', 0),
        'missedIngredientCount': recipe_data.get('missedIngredientCount', 0),
        'missedIngredients': missed_list,
        'likes': recipe_data.get('aggregateLikes', 0)
    }


def format_recipe_detail(recipe_data):
    """Format raw Spoonacular data into full detail format."""
    ingredients = []
    for ing in recipe_data.get('extendedIngredients', []):
        ingredients.append({
            'id': ing.get('id'),
            'name': ing.get('name', ''),
            'original': ing.get('original', ''),
            'amount': ing.get('amount', 0),
            'unit': ing.get('unit', '')
        })

    instructions = []
    analyzed = recipe_data.get('analyzedInstructions', [])
    if analyzed:
        for step in analyzed[0].get('steps', []):
            instructions.append({
                'number': step.get('number'),
                'step': step.get('step', '')
            })

    # Extract nutrition summary if available
    nutrition = {}
    nutr_data = recipe_data.get('nutrition', {})
    if nutr_data:
        for n in nutr_data.get('nutrients', []):
            name = n.get('name', '')
            if name in ('Calories', 'Protein', 'Fat', 'Carbohydrates', 'Fiber', 'Sugar'):
                nutrition[name] = {'amount': round(n.get('amount', 0)), 'unit': n.get('unit', '')}

    return {
        'id': recipe_data.get('id'),
        'title': recipe_data.get('title', ''),
        'image': recipe_data.get('image', ''),
        'readyInMinutes': recipe_data.get('readyInMinutes', 0),
        'servings': recipe_data.get('servings', 0),
        'cuisines': recipe_data.get('cuisines', []),
        'dishTypes': recipe_data.get('dishTypes', []),
        'diets': recipe_data.get('diets', []),
        'summary': recipe_data.get('summary', ''),
        'instructions': instructions,
        'ingredients': ingredients,
        'sourceUrl': recipe_data.get('sourceUrl', ''),
        'sourceName': recipe_data.get('sourceName', ''),
        'likes': recipe_data.get('aggregateLikes', 0),
        'healthScore': recipe_data.get('healthScore', 0),
        'vegetarian': recipe_data.get('vegetarian', False),
        'vegan': recipe_data.get('vegan', False),
        'glutenFree': recipe_data.get('glutenFree', False),
        'dairyFree': recipe_data.get('dairyFree', False),
        'nutrition': nutrition
    }
