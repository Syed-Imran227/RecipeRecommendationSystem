"""PyTest fixtures for the Recipe Recommendation System with Supabase."""

import os
import pytest
from unittest.mock import MagicMock, patch


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    os.environ['SPOONACULAR_API_KEY'] = 'test-key'
    os.environ['SUPABASE_URL'] = 'https://test.supabase.co'
    os.environ['SUPABASE_KEY'] = 'test-key'

    from app import create_app
    app = create_app('testing')
    yield app


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture
def mock_supabase():
    """Mock the Supabase client for testing."""
    mock = MagicMock()

    # Helper to create chainable query mocks
    def make_query_mock(return_data=None):
        query = MagicMock()
        query.select.return_value = query
        query.insert.return_value = query
        query.delete.return_value = query
        query.eq.return_value = query
        query.order.return_value = query
        query.limit.return_value = query

        result = MagicMock()
        result.data = return_data or []
        query.execute.return_value = result
        return query

    mock.table.side_effect = lambda name: make_query_mock()
    return mock


@pytest.fixture
def auth_client(app, mock_supabase):
    """Flask test client with mocked Supabase and authenticated session."""
    with patch('app.routes.auth.supabase', mock_supabase), \
         patch('app.routes.favorites.supabase', mock_supabase), \
         patch('app.routes.history.supabase', mock_supabase), \
         patch('app.routes.recipes.supabase', mock_supabase):

        client = app.test_client()
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        yield client, mock_supabase
