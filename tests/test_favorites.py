"""Tests for favorites endpoints with Supabase mocking."""

from unittest.mock import patch, MagicMock


def _mock_table(return_data=None):
    mock = MagicMock()
    mock.select.return_value = mock
    mock.insert.return_value = mock
    mock.delete.return_value = mock
    mock.eq.return_value = mock
    mock.order.return_value = mock
    result = MagicMock()
    result.data = return_data or []
    mock.execute.return_value = result
    return mock


def test_add_favorite(client):
    """Test adding a recipe to favorites."""
    table_mock = _mock_table()
    select_result = MagicMock()
    select_result.data = []  # no duplicate
    insert_result = MagicMock()
    insert_result.data = [{'id': 1, 'user_id': 1, 'recipe_id': 123, 'recipe_title': 'Test'}]
    table_mock.execute.side_effect = [select_result, insert_result]

    with patch('app.routes.favorites.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.post('/api/favorites', json={
            'recipe_id': 123, 'recipe_title': 'Test', 'recipe_image': ''
        })
    assert resp.status_code == 201


def test_add_favorite_duplicate(client):
    """Test adding same recipe twice."""
    table_mock = _mock_table([{'id': 1}])  # duplicate found

    with patch('app.routes.favorites.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.post('/api/favorites', json={
            'recipe_id': 123, 'recipe_title': 'Test', 'recipe_image': ''
        })
    assert resp.status_code == 409


def test_list_favorites(client):
    """Test listing favorites."""
    table_mock = _mock_table([
        {'id': 1, 'recipe_id': 111, 'recipe_title': 'Recipe 1'},
        {'id': 2, 'recipe_id': 222, 'recipe_title': 'Recipe 2'}
    ])

    with patch('app.routes.favorites.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.get('/api/favorites')
    assert resp.status_code == 200
    assert len(resp.get_json()['favorites']) == 2


def test_remove_favorite(client):
    """Test removing a favorite."""
    table_mock = _mock_table()
    select_result = MagicMock()
    select_result.data = [{'id': 1}]  # found
    delete_result = MagicMock()
    delete_result.data = []
    table_mock.execute.side_effect = [select_result, delete_result]

    with patch('app.routes.favorites.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.delete('/api/favorites/123')
    assert resp.status_code == 200


def test_remove_nonexistent_favorite(client):
    """Test removing a favorite that doesn't exist."""
    table_mock = _mock_table([])  # not found

    with patch('app.routes.favorites.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.delete('/api/favorites/99999')
    assert resp.status_code == 404


def test_favorites_require_auth(client):
    """Test that favorites endpoints require login."""
    resp = client.get('/api/favorites')
    assert resp.status_code == 401


def test_add_favorite_missing_id(client):
    """Test adding favorite without recipe_id."""
    with patch('app.routes.favorites.supabase'):
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.post('/api/favorites', json={'recipe_title': 'Test'})
    assert resp.status_code == 400
