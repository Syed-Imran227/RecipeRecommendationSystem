import json
from dotenv import load_dotenv
load_dotenv()
from app import create_app

def run_tests():
    app = create_app()
    app.testing = True
    client = app.test_client()

    results = []

    def check(name, res, expected_key):
        try:
            data = res.json
            passed = res.status_code == 200 and expected_key in data
            results.append(f"{'PASS' if passed else 'FAIL'} {name} (Status: {res.status_code})")
            if not passed:
                results.append(f"   Response: {data}")
            return data
        except Exception as e:
            results.append(f"FAIL {name} (Exception: {str(e)})")
            return None

    print("Running integration tests for new features...\n")

    # Feature 1
    res = client.get('/api/recipes/autocomplete/ingredients?query=appl')
    check("Feature 1: Ingredient Autocomplete", res, "suggestions")

    # Feature 8
    res = client.get('/api/recipes/autocomplete/recipes?query=past')
    check("Feature 8: Recipe Autocomplete", res, "suggestions")

    # Feature 3 & 4 (Also tests 2 implicitly if ingredients provided)
    res = client.post('/api/recipes/search', json={'query': 'pasta', 'intolerances': 'dairy', 'sort': 'time'})
    search_data = check("Feature 3 & 4: Search w/ Intolerances & Sort", res, "recipes")

    recipe_id = 716429 # Fallback ID (Pasta with Garlic, Scallions)
    if search_data and search_data.get('recipes'):
        recipe_id = search_data['recipes'][0]['id']

    # Detail includes Feature 5 summary
    res = client.get(f'/api/recipes/{recipe_id}')
    check("Recipe Detail (Base + formatting)", res, "recipe")

    # Feature 5
    res = client.get(f'/api/recipes/{recipe_id}/nutrition')
    check("Feature 5: Nutrition Widget", res, "nutrition")

    # Feature 6
    res = client.get(f'/api/recipes/{recipe_id}/similar')
    check("Feature 6: Similar Recipes", res, "recipes")

    # Feature 7
    res = client.get(f'/api/recipes/{recipe_id}/nutrition-label-url')
    check("Feature 7: Nutrition Label URL", res, "url")

    # Feature 9
    res = client.post('/api/recipes/meal-plan', json={'calories': 2000, 'time_frame': 'day'})
    check("Feature 9: Meal Planner", res, "plan")

    # Feature 11
    res = client.get('/api/recipes/substitutes?ingredient=butter')
    check("Feature 11: Ingredient Substitutes", res, "substitutes")

    # Feature 12
    res = client.post('/api/recipes/extract', json={'url': 'https://www.allrecipes.com/recipe/158140/spaghetti-sauce-with-ground-beef/'})
    check("Feature 12: Extract Recipe from URL", res, "recipe")

    print('\n'.join(results))

if __name__ == '__main__':
    run_tests()
