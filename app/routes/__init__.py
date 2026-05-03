"""Route blueprints registration."""

from flask import Blueprint

auth_bp = Blueprint('auth', __name__)
recipes_bp = Blueprint('recipes', __name__)
favorites_bp = Blueprint('favorites', __name__)
history_bp = Blueprint('history', __name__)

from . import auth, recipes, favorites, history  # noqa: E402, F401
