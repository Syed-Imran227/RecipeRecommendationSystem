"""Application factory for the Recipe Recommendation System."""

import os
from flask import Flask, send_from_directory
from .config import config


def create_app(config_name=None):
    """Create and configure the Flask application."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__, static_folder='static', static_url_path='/static')
    app.config.from_object(config.get(config_name, config['default']))

    # Initialize Supabase client (skip for testing)
    if config_name != 'testing':
        from .extensions import init_supabase
        init_supabase()

    # Register blueprints
    from .routes import auth_bp, recipes_bp, favorites_bp, history_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recipes_bp, url_prefix='/api/recipes')
    app.register_blueprint(favorites_bp, url_prefix='/api/favorites')
    app.register_blueprint(history_bp, url_prefix='/api/history')

    # Serve the SPA for all non-API routes
    @app.route('/')
    @app.route('/<path:path>')
    def serve_spa(path=''):
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    return app
