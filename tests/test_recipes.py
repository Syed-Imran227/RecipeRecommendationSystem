"""Tests for the Spoonacular client formatting functions."""

from app.services.spoonacular_client import format_recipe_card, format_recipe_detail


def test_format_recipe_card_basic():
    """Test formatting raw API data into card format."""
    raw = {
        'id': 123, 'title': 'Test Recipe', 'image': 'http://img.jpg',
        'readyInMinutes': 30, 'servings': 4, 'cuisines': ['Italian'],
        'dishTypes': ['main course'], 'diets': ['vegetarian'],
        'summary': 'A test recipe', 'aggregateLikes': 10,
        'usedIngredientCount': 3, 'missedIngredientCount': 2
    }
    result = format_recipe_card(raw)
    assert result['id'] == 123
    assert result['title'] == 'Test Recipe'
    assert result['readyInMinutes'] == 30
    assert result['usedIngredientCount'] == 3
    assert 'Italian' in result['cuisines']


def test_format_recipe_card_empty():
    """Test formatting with missing fields."""
    result = format_recipe_card({})
    assert result['id'] is None
    assert result['title'] == ''
    assert result['readyInMinutes'] == 0


def test_format_recipe_detail_with_instructions():
    """Test formatting full recipe detail with instructions."""
    raw = {
        'id': 456, 'title': 'Detail Recipe', 'image': 'http://img.jpg',
        'readyInMinutes': 45, 'servings': 2, 'cuisines': ['Indian'],
        'dishTypes': ['dinner'], 'diets': ['vegan'], 'summary': 'Good food',
        'extendedIngredients': [
            {'id': 1, 'name': 'tomato', 'original': '2 tomatoes', 'amount': 2, 'unit': ''},
            {'id': 2, 'name': 'onion', 'original': '1 onion', 'amount': 1, 'unit': ''}
        ],
        'analyzedInstructions': [{
            'steps': [
                {'number': 1, 'step': 'Chop vegetables'},
                {'number': 2, 'step': 'Cook everything'}
            ]
        }],
        'sourceUrl': 'http://source.com', 'sourceName': 'Source',
        'aggregateLikes': 5, 'healthScore': 80,
        'vegetarian': False, 'vegan': True, 'glutenFree': True, 'dairyFree': True
    }
    result = format_recipe_detail(raw)
    assert result['id'] == 456
    assert len(result['ingredients']) == 2
    assert result['ingredients'][0]['name'] == 'tomato'
    assert len(result['instructions']) == 2
    assert result['instructions'][0]['step'] == 'Chop vegetables'
    assert result['vegan'] is True


def test_format_recipe_detail_no_instructions():
    """Test formatting recipe with no instructions."""
    raw = {'id': 789, 'title': 'Simple', 'analyzedInstructions': []}
    result = format_recipe_detail(raw)
    assert result['instructions'] == []
    assert result['ingredients'] == []
