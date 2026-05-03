/* ===== API Client ===== */

const API = {
    async _fetch(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            ...options
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    },

    // Auth
    register:  (name, email, password) => API._fetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
    login:     (email, password)       => API._fetch('/api/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout:    ()                      => API._fetch('/api/auth/logout',   { method: 'POST' }),
    getMe:     ()                      => API._fetch('/api/auth/me'),

    // Recipes
    searchRecipes: (ingredients, filters = {}) =>
        API._fetch('/api/recipes/search', { method: 'POST', body: JSON.stringify({ ingredients, ...filters }) }),
    searchByQuery: (query, filters = {}) =>
        API._fetch('/api/recipes/search', { method: 'POST', body: JSON.stringify({ query, ...filters }) }),
    getRecipeDetails: (id) => API._fetch(`/api/recipes/${id}`),
    getRandomRecipes: (number = 12) => API._fetch(`/api/recipes/random?number=${number}`),

    // Feature 1 — Ingredient autocomplete
    autocompleteIngredients: (query) => API._fetch(`/api/recipes/autocomplete/ingredients?query=${encodeURIComponent(query)}`),

    // Feature 5 — Nutrition
    getNutrition: (id) => API._fetch(`/api/recipes/${id}/nutrition`),

    // Feature 6 — Similar recipes
    getSimilarRecipes: (id) => API._fetch(`/api/recipes/${id}/similar`),

    // Feature 7 — Nutrition label URL
    getNutritionLabelUrl: (id) => API._fetch(`/api/recipes/${id}/nutrition-label-url`),

    // Feature 8 — Recipe autocomplete
    autocompleteRecipes: (query) => API._fetch(`/api/recipes/autocomplete/recipes?query=${encodeURIComponent(query)}`),

    // Feature 9 — Meal planner
    generateMealPlan: (payload) => API._fetch('/api/recipes/meal-plan', { method: 'POST', body: JSON.stringify(payload) }),

    // Feature 11 — Ingredient substitutes
    getSubstitutes: (ingredient) => API._fetch(`/api/recipes/substitutes?ingredient=${encodeURIComponent(ingredient)}`),

    // Feature 12 — Extract recipe from URL
    extractRecipe: (url) => API._fetch('/api/recipes/extract', { method: 'POST', body: JSON.stringify({ url }) }),

    // Favorites
    getFavorites:  ()                           => API._fetch('/api/favorites'),
    addFavorite:   (id, title, image)           => API._fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ recipe_id: id, recipe_title: title, recipe_image: image }) }),
    removeFavorite:(id)                         => API._fetch(`/api/favorites/${id}`, { method: 'DELETE' }),
    checkFavorite: (id)                         => API._fetch(`/api/favorites/check/${id}`),

    // History
    getHistory:   () => API._fetch('/api/history'),
    clearHistory: () => API._fetch('/api/history', { method: 'DELETE' })
};
