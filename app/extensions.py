"""Supabase client initialization."""

import os
from supabase import create_client, Client


def get_supabase() -> Client:
    """Get the Supabase client instance."""
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')

    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")

    return create_client(url, key)


# Singleton client instance
supabase: Client = None


def init_supabase():
    """Initialize the global Supabase client."""
    global supabase
    supabase = get_supabase()
    return supabase
