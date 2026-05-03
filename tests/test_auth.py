"""Tests for authentication endpoints with Supabase mocking."""

from unittest.mock import patch, MagicMock
from werkzeug.security import generate_password_hash


def _mock_supabase_table(return_data=None):
    """Create a chainable Supabase table mock."""
    mock = MagicMock()
    mock.select.return_value = mock
    mock.insert.return_value = mock
    mock.eq.return_value = mock
    result = MagicMock()
    result.data = return_data or []
    mock.execute.return_value = result
    return mock


def test_register_success(client):
    """Test successful user registration."""
    table_mock = _mock_supabase_table()
    # First call (select to check existing) returns empty, second (insert) returns user
    select_result = MagicMock()
    select_result.data = []
    insert_result = MagicMock()
    insert_result.data = [{'id': 1, 'name': 'John', 'email': 'john@test.com'}]
    table_mock.execute.side_effect = [select_result, insert_result]

    with patch('app.routes.auth.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        resp = client.post('/api/auth/register', json={
            'name': 'John', 'email': 'john@test.com', 'password': 'pass123'
        })
    assert resp.status_code == 201
    assert resp.get_json()['user']['name'] == 'John'


def test_register_missing_fields(client):
    """Test registration with missing fields."""
    with patch('app.routes.auth.supabase'):
        resp = client.post('/api/auth/register', json={'name': 'John'})
    assert resp.status_code == 400


def test_register_short_password(client):
    """Test registration with short password."""
    with patch('app.routes.auth.supabase'):
        resp = client.post('/api/auth/register', json={
            'name': 'John', 'email': 'john@test.com', 'password': '123'
        })
    assert resp.status_code == 400


def test_register_duplicate_email(client):
    """Test registration with already used email."""
    table_mock = _mock_supabase_table([{'id': 1}])  # existing user found

    with patch('app.routes.auth.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        resp = client.post('/api/auth/register', json={
            'name': 'John', 'email': 'john@test.com', 'password': 'pass123'
        })
    assert resp.status_code == 409


def test_login_success(client):
    """Test successful login."""
    pw_hash = generate_password_hash('pass123')
    table_mock = _mock_supabase_table([{
        'id': 1, 'name': 'John', 'email': 'john@test.com', 'password_hash': pw_hash
    }])

    with patch('app.routes.auth.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        resp = client.post('/api/auth/login', json={
            'email': 'john@test.com', 'password': 'pass123'
        })
    assert resp.status_code == 200


def test_login_wrong_password(client):
    """Test login with wrong password."""
    pw_hash = generate_password_hash('correct')
    table_mock = _mock_supabase_table([{
        'id': 1, 'name': 'John', 'email': 'john@test.com', 'password_hash': pw_hash
    }])

    with patch('app.routes.auth.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        resp = client.post('/api/auth/login', json={
            'email': 'john@test.com', 'password': 'wrong'
        })
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    """Test login with non-existent email."""
    table_mock = _mock_supabase_table([])  # no user found

    with patch('app.routes.auth.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@test.com', 'password': 'pass123'
        })
    assert resp.status_code == 401


def test_logout(client):
    """Test logout clears session."""
    resp = client.post('/api/auth/logout')
    assert resp.status_code == 200


def test_get_me_unauthenticated(client):
    """Test getting current user when not logged in."""
    resp = client.get('/api/auth/me')
    assert resp.status_code == 401
