"""Tests for search history endpoints with Supabase mocking."""

from unittest.mock import patch, MagicMock


def _mock_table(return_data=None):
    mock = MagicMock()
    mock.select.return_value = mock
    mock.delete.return_value = mock
    mock.eq.return_value = mock
    mock.order.return_value = mock
    mock.limit.return_value = mock
    result = MagicMock()
    result.data = return_data or []
    mock.execute.return_value = result
    return mock


def test_history_empty(client):
    """Test empty history returns empty list."""
    table_mock = _mock_table([])

    with patch('app.routes.history.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.get('/api/history')
    assert resp.status_code == 200
    assert resp.get_json()['history'] == []


def test_clear_history(client):
    """Test clearing history."""
    table_mock = _mock_table()

    with patch('app.routes.history.supabase') as mock_sb:
        mock_sb.table.return_value = table_mock
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        resp = client.delete('/api/history')
    assert resp.status_code == 200


def test_history_requires_auth(client):
    """Test history requires login."""
    resp = client.get('/api/history')
    assert resp.status_code == 401

    resp = client.delete('/api/history')
    assert resp.status_code == 401
