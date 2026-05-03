# 🍳 FlavorFind — Recipe Recommendation System

A smart recipe recommendation web application that helps users discover recipes based on ingredients they already have, with filters for diet, cuisine, cooking time, and meal type.

**Powered by [Spoonacular API](https://spoonacular.com/food-api)**

## Features

- 🔍 **Ingredient-based search** — Enter what you have, find what to cook
- 🥗 **Smart filters** — Vegetarian, vegan, gluten-free, cuisine, meal type, cooking time
- 📖 **Recipe details** — Step-by-step instructions, ingredients list, nutrition info
- ❤️ **Favorites** — Save recipes for quick access later
- 📜 **Search history** — Revisit and repeat previous searches
- 👤 **User accounts** — Register and login to persist data
- 📱 **Responsive design** — Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| Frontend | HTML, CSS, JavaScript |
| Database | SQLite (dev) / PostgreSQL (prod) |
| API | Spoonacular Food API |
| Testing | PyTest |
| CI/CD | GitHub Actions |
| Deployment | Render |

## Quick Start

### Prerequisites
- Python 3.9+
- [Spoonacular API key](https://spoonacular.com/food-api) (free tier available)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd "Recipe Recommendation System"

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your SPOONACULAR_API_KEY

# Run the application
python run.py
```

Visit `http://localhost:5000` in your browser.

### Running Tests

```bash
pytest -v
pytest --cov=app --cov-report=term-missing
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Current user |
| `/api/recipes/search` | POST | Search by ingredients/query |
| `/api/recipes/<id>` | GET | Recipe details |
| `/api/recipes/random` | GET | Random recipes |
| `/api/favorites` | GET/POST | List/Add favorites |
| `/api/favorites/<id>` | DELETE | Remove favorite |
| `/api/history` | GET/DELETE | View/Clear history |

## Project Structure

```
├── app/
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuration
│   ├── extensions.py        # Flask extensions
│   ├── models.py            # Database models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic & API client
│   └── static/              # Frontend (HTML/CSS/JS)
├── tests/                   # PyTest test suite
├── .github/workflows/       # GitHub Actions CI
├── requirements.txt
├── run.py                   # Dev server entry
└── render.yaml              # Render deployment
```

## License

This project is for educational purposes.
