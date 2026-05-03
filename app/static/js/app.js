/* ===== Main Application Controller ===== */
const App = {
    currentUser: null,
    ingredients: [],
    acTimer: null,

    async init() {
        try { const d = await API.getMe(); this.currentUser = d.user; } catch(e) { this.currentUser = null; }
        this.updateAuthUI();
        this.bindGlobalEvents();
        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    updateAuthUI() {
        const authDiv = document.getElementById('nav-auth');
        const navLinks = document.getElementById('nav-links');
        if (this.currentUser) {
            navLinks.style.display = '';
            authDiv.innerHTML = `<span class="nav-user"><span class="nav-user-name">👤 ${sanitize(this.currentUser.name)}</span></span>
                <button class="btn btn-ghost btn-sm" id="btn-logout">Logout</button>`;
            document.getElementById('btn-logout').addEventListener('click', () => this.logout());
        } else {
            navLinks.style.display = 'none';
            authDiv.innerHTML = `<a href="#/login" class="btn btn-ghost btn-sm">Login</a>
                <a href="#/register" class="btn btn-primary btn-sm">Sign Up</a>`;
        }
    },

    bindGlobalEvents() {
        document.getElementById('nav-toggle').addEventListener('click', () => {
            document.getElementById('navbar').classList.toggle('open');
        });
    },

    updateActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    },

    handleRoute() {
        const hash = window.location.hash || '#/';
        const app = document.getElementById('app');
        if (!this.currentUser) {
            this.showLanding(app, hash === '#/register' ? 'register' : 'login');
            return;
        }
        if (hash === '#/' || hash === '' || hash === '#/login' || hash === '#/register') {
            this.updateActiveNav('home'); this.showHome(app);
        } else if (hash.startsWith('#/recipe/')) {
            this.updateActiveNav(''); this.showRecipeDetail(app, hash.split('/')[2]);
        } else if (hash === '#/favorites') {
            this.updateActiveNav('favorites'); this.showFavorites(app);
        } else if (hash === '#/history') {
            this.updateActiveNav('history'); this.showHistory(app);
        } else if (hash === '#/meal-planner') {
            this.updateActiveNav('planner'); this.showMealPlanner(app);
        } else {
            this.updateActiveNav('home'); this.showHome(app);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ── Landing ─────────────────────────────────────────────────────────────
    showLanding(container, mode) {
        container.innerHTML = Components.landingPage(mode);
        const formId = mode === 'register' ? 'register-form' : 'login-form';
        document.getElementById(formId).addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                let data;
                if (mode === 'register') {
                    data = await API.register(
                        document.getElementById('reg-name').value,
                        document.getElementById('reg-email').value,
                        document.getElementById('reg-password').value
                    );
                } else {
                    data = await API.login(
                        document.getElementById('login-email').value,
                        document.getElementById('login-password').value
                    );
                }
                this.currentUser = data.user;
                this.updateAuthUI();
                showToast(mode === 'register' ? 'Welcome to Recipe Finder!' : 'Welcome back!', 'success');
                window.location.hash = '#/';
                this.handleRoute();
            } catch(err) { showToast(err.message, 'error'); }
        });
    },

    // ── Home ────────────────────────────────────────────────────────────────
    showHome(container) {
        container.innerHTML = Components.home(this.currentUser.name);
        this.bindSearchEvents();
        this.loadFeaturedRecipes();
    },

    bindSearchEvents() {
        const input  = document.getElementById('ingredient-input');
        const addBtn = document.getElementById('add-ingredient-btn');
        const searchBtn = document.getElementById('search-btn');
        const extractBtn = document.getElementById('extract-url-btn');

        const addIngredient = () => {
            const val = input.value.trim().toLowerCase();
            if (val && !this.ingredients.includes(val)) {
                this.ingredients.push(val);
                this.renderIngredientTags();
            }
            input.value = '';
            this.hideAutocomplete();
            input.focus();
        };

        addBtn.addEventListener('click', addIngredient);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } });

        // Feature 1 — Ingredient autocomplete
        input.addEventListener('input', () => {
            clearTimeout(this.acTimer);
            const q = input.value.trim();
            if (q.length < 2) { this.hideAutocomplete(); return; }
            this.acTimer = setTimeout(() => this.showIngredientAutocomplete(q), 250);
        });

        searchBtn.addEventListener('click', () => this.performSearch());

        // Feature 12 — Extract recipe from URL
        if (extractBtn) extractBtn.addEventListener('click', () => this.showExtractModal());
    },

    // Feature 1 — Autocomplete dropdown
    async showIngredientAutocomplete(query) {
        try {
            const data = await API.autocompleteIngredients(query);
            const suggestions = data.suggestions || [];
            this.hideAutocomplete();
            if (!suggestions.length) return;

            const wrap = document.querySelector('.autocomplete-wrap') || document.getElementById('ingredient-input').parentElement;
            const list = document.createElement('div');
            list.className = 'autocomplete-list';
            list.id = 'autocomplete-list';
            list.innerHTML = suggestions.map(s => `
                <div class="autocomplete-item" data-name="${sanitize(s.name)}">
                    ${s.image ? `<img src="https://img.spoonacular.com/ingredients_100x100/${s.image}" alt="">` : '🥕'}
                    ${sanitize(s.name)}
                </div>`).join('');

            list.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    const val = item.dataset.name;
                    if (val && !this.ingredients.includes(val)) {
                        this.ingredients.push(val);
                        this.renderIngredientTags();
                    }
                    document.getElementById('ingredient-input').value = '';
                    this.hideAutocomplete();
                });
            });

            const inputEl = document.getElementById('ingredient-input');
            inputEl.parentElement.style.position = 'relative';
            inputEl.parentElement.appendChild(list);
            document.addEventListener('click', this._acClickOutside = (e) => {
                if (!list.contains(e.target) && e.target !== inputEl) this.hideAutocomplete();
            }, { once: true });
        } catch(e) { /* silent */ }
    },

    hideAutocomplete() {
        document.getElementById('autocomplete-list')?.remove();
    },

    renderIngredientTags() {
        const container = document.getElementById('ingredient-tags');
        if (!container) return;
        container.innerHTML = this.ingredients.map(ing =>
            `<span class="ingredient-tag">${sanitize(ing)}<button data-ing="${sanitize(ing)}">&times;</button></span>`
        ).join('');
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.ingredients = this.ingredients.filter(i => i !== btn.dataset.ing);
                this.renderIngredientTags();
            });
        });
    },

    async performSearch() {
        const query       = document.getElementById('ingredient-input').value.trim();
        const diet        = document.getElementById('filter-diet').value;
        const cuisine     = document.getElementById('filter-cuisine').value;
        const mealType    = document.getElementById('filter-type').value;
        const maxTime     = document.getElementById('filter-time').value;
        const intolerances= document.getElementById('filter-intolerance')?.value || '';  // Feature 3
        const sort        = document.getElementById('filter-sort')?.value || '';          // Feature 4

        if (!this.ingredients.length && !query) { showToast('Please add ingredients or enter a search term', 'error'); return; }

        const resultsSection  = document.getElementById('results-section');
        const resultsGrid     = document.getElementById('results-grid');
        const featuredSection = document.getElementById('featured-section');
        resultsSection.style.display = 'block';
        resultsGrid.innerHTML = Components.loading();
        featuredSection.style.display = 'none';

        try {
            const filters = { diet, cuisine, meal_type: mealType, max_ready_time: maxTime || undefined, intolerances, sort };
            const data = this.ingredients.length
                ? await API.searchRecipes(this.ingredients, filters)
                : await API.searchByQuery(query, filters);

            const recipes = data.recipes || [];
            document.getElementById('results-title').textContent = `🍽️ ${recipes.length} Recipes Found`;
            resultsGrid.innerHTML = recipes.length
                ? recipes.map((r, i) => Components.recipeCard(r, i)).join('')
                : Components.emptyState('🔍', 'No recipes found', 'Try different ingredients or filters.');
            this.bindCardClicks(resultsGrid);
        } catch(err) {
            resultsGrid.innerHTML = Components.emptyState('⚠️', 'Error', err.message);
        }
    },

    async loadFeaturedRecipes() {
        const grid = document.getElementById('featured-grid');
        if (!grid) return;
        grid.innerHTML = Components.loading();
        try {
            const data = await API.getRandomRecipes(12);
            grid.innerHTML = (data.recipes || []).map((r, i) => Components.recipeCard(r, i)).join('');
            this.bindCardClicks(grid);
        } catch(err) { grid.innerHTML = Components.emptyState('⚠️', 'Could not load', err.message); }
    },

    bindCardClicks(container) {
        container.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.remove-fav-btn')) return;
                window.location.hash = `#/recipe/${card.dataset.recipeId}`;
            });
        });
    },

    // ── Recipe Detail ────────────────────────────────────────────────────────
    async showRecipeDetail(container, id) {
        container.innerHTML = Components.loading();
        try {
            const [recipeData, favData] = await Promise.all([
                API.getRecipeDetails(id),
                API.checkFavorite(id).catch(() => ({ is_favorite: false }))
            ]);
            container.innerHTML = Components.recipeDetail(recipeData.recipe, favData.is_favorite);
            this.bindFavoriteButton();
            this.loadSimilarRecipes(id);      // Feature 6
            this.loadNutritionLabel(id);       // Feature 7
            this.bindSubstituteButtons();      // Feature 11
        } catch(err) {
            container.innerHTML = Components.emptyState('⚠️', 'Recipe not found', err.message);
        }
    },

    bindFavoriteButton() {
        const btn = document.getElementById('fav-detail-btn');
        if (!btn) return;
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            const isActive = btn.classList.contains('active');
            try {
                if (isActive) {
                    await API.removeFavorite(id);
                    btn.classList.remove('active'); btn.innerHTML = '🤍';
                    showToast('Removed from favorites', 'info');
                } else {
                    await API.addFavorite(id, btn.dataset.title, btn.dataset.image);
                    btn.classList.add('active'); btn.innerHTML = '❤️';
                    showToast('Added to favorites!', 'success');
                }
            } catch(err) { showToast(err.message, 'error'); }
        });
    },

    // Feature 6 — Similar recipes
    async loadSimilarRecipes(id) {
        const section = document.getElementById('similar-section');
        if (!section) return;
        try {
            const data = await API.getSimilarRecipes(id);
            const recipes = data.recipes || [];
            if (!recipes.length) { section.style.display = 'none'; return; }
            section.innerHTML = `<div class="recipe-section">
                <h2>You Might Also Like</h2>
                <div class="similar-scroll">
                    ${recipes.map(r => `
                        <div class="similar-card" data-id="${r.id}">
                            <img src="https://img.spoonacular.com/recipes/${r.id}-312x231.jpg" alt="${sanitize(r.title)}" loading="lazy">
                            <div class="similar-card-body">
                                <div class="similar-card-title">${sanitize(r.title)}</div>
                                <div class="similar-card-time">⏱ ${formatTime(r.readyInMinutes)}</div>
                            </div>
                        </div>`).join('')}
                </div></div>`;
            section.querySelectorAll('.similar-card').forEach(c => {
                c.addEventListener('click', () => { window.location.hash = `#/recipe/${c.dataset.id}`; });
            });
        } catch(e) { section.style.display = 'none'; }
    },

    // Feature 7 — Nutrition label image
    async loadNutritionLabel(id) {
        const container = document.getElementById('nutrition-label-container');
        if (!container) return;
        try {
            const data = await API.getNutritionLabelUrl(id);
            container.innerHTML = `<img src="${data.url}" alt="Nutrition Label" style="max-width:280px;border-radius:8px;border:1px solid var(--border)">`;
        } catch(e) { container.innerHTML = ''; }
    },

    // Feature 11 — Ingredient substitutes
    bindSubstituteButtons() {
        document.querySelectorAll('.sub-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const ing = btn.dataset.ingredient;
                try {
                    const data = await API.getSubstitutes(ing);
                    const subs = data.substitutes || [];
                    this.showModal(`Substitutes for <em>${sanitize(ing)}</em>`,
                        subs.length
                            ? `<ul class="substitute-list">${subs.map(s => `<li>${sanitize(s)}</li>`).join('')}</ul>`
                            : `<p>No substitutes found for <strong>${sanitize(ing)}</strong>.</p>`
                    );
                } catch(err) { showToast('Could not load substitutes', 'error'); }
            });
        });
    },

    // Feature 12 — Extract from URL modal
    showExtractModal() {
        this.showModal('Import Recipe from URL',
            `<p>Paste any recipe URL and we'll import it automatically.</p>
            <input class="modal-input" id="extract-url-input" placeholder="https://www.allrecipes.com/recipe/..." type="url">
            <button class="btn btn-primary btn-lg" id="extract-url-submit" style="width:100%">🔗 Import Recipe</button>`,
            async () => {
                const url = document.getElementById('extract-url-input')?.value.trim();
                if (!url) { showToast('Please enter a URL', 'error'); return; }
                const btn = document.getElementById('extract-url-submit');
                btn.textContent = 'Importing...'; btn.disabled = true;
                try {
                    const data = await API.extractRecipe(url);
                    this.closeModal();
                    const app = document.getElementById('app');
                    app.innerHTML = Components.recipeDetail(data.recipe, false);
                    this.bindFavoriteButton();
                    this.bindSubstituteButtons();
                    showToast('Recipe imported!', 'success');
                } catch(err) { showToast(err.message, 'error'); btn.textContent = '🔗 Import Recipe'; btn.disabled = false; }
            }
        );
    },

    // ── Modal helper ─────────────────────────────────────────────────────────
    showModal(title, bodyHtml, onAction = null) {
        document.getElementById('modal-root')?.remove();
        const wrap = document.createElement('div');
        wrap.id = 'modal-root';
        wrap.className = 'modal-overlay';
        wrap.innerHTML = `<div class="modal">
            <button class="modal-close" id="modal-close-btn">✕</button>
            <h2>${title}</h2>
            <div id="modal-body">${bodyHtml}</div>
        </div>`;
        document.body.appendChild(wrap);
        wrap.addEventListener('click', (e) => { if (e.target === wrap) this.closeModal(); });
        document.getElementById('modal-close-btn').addEventListener('click', () => this.closeModal());
    },

    closeModal() { document.getElementById('modal-root')?.remove(); },

    // ── Favorites ─────────────────────────────────────────────────────────────
    async showFavorites(container) {
        container.innerHTML = Components.loading();
        try {
            const data = await API.getFavorites();
            container.innerHTML = Components.favoritesPage(data.favorites);
            this.bindCardClicks(container);
            container.querySelectorAll('.remove-fav-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try { await API.removeFavorite(parseInt(btn.dataset.recipeId)); showToast('Removed', 'info'); this.showFavorites(container); }
                    catch(err) { showToast(err.message, 'error'); }
                });
            });
        } catch(err) { container.innerHTML = Components.emptyState('⚠️', 'Error', err.message); }
    },

    // ── History ───────────────────────────────────────────────────────────────
    async showHistory(container) {
        container.innerHTML = Components.loading();
        try {
            const data = await API.getHistory();
            container.innerHTML = Components.historyPage(data.history);
            container.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.ingredients = item.dataset.query.split(',').map(s => s.trim()).filter(Boolean);
                    window.location.hash = '#/';
                    setTimeout(() => { this.renderIngredientTags(); this.performSearch(); }, 100);
                });
            });
            document.getElementById('clear-history-btn')?.addEventListener('click', async () => {
                try { await API.clearHistory(); showToast('History cleared', 'success'); this.showHistory(container); }
                catch(err) { showToast(err.message, 'error'); }
            });
        } catch(err) { container.innerHTML = Components.emptyState('⚠️', 'Error', err.message); }
    },

    // ── Feature 9 — Meal Planner ──────────────────────────────────────────────
    showMealPlanner(container) {
        container.innerHTML = `
        <div class="page-header"><h1>🗓️ Meal Planner</h1><p>Generate a personalized daily or weekly meal plan</p></div>
        <div class="section-container" style="max-width:680px;margin:0 auto">
            <div class="search-box">
                <div class="filters-row">
                    <div class="form-group" style="flex:1;margin:0"><label style="color:var(--text-m);font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.35rem;display:block">Calories / Day</label>
                        <input type="number" class="search-input" id="plan-calories" value="2000" min="500" max="5000" step="100"></div>
                    <select class="filter-select" id="plan-diet">
                        <option value="">Any Diet</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten free">Gluten Free</option>
                        <option value="ketogenic">Ketogenic</option>
                        <option value="paleo">Paleo</option>
                    </select>
                    <select class="filter-select" id="plan-timeframe">
                        <option value="day">1 Day</option>
                        <option value="week">1 Week</option>
                    </select>
                </div>
                <input type="text" class="search-input" id="plan-exclude" placeholder="Exclude ingredients (e.g. mushrooms, anchovies)" style="margin-top:0.6rem">
                <button class="btn btn-primary btn-lg" id="generate-plan-btn" style="width:100%;margin-top:0.75rem">🗓️ Generate Meal Plan</button>
            </div>
            <div id="plan-results"></div>
        </div>`;

        document.getElementById('generate-plan-btn').addEventListener('click', async () => {
            const btn = document.getElementById('generate-plan-btn');
            const results = document.getElementById('plan-results');
            btn.textContent = 'Generating...'; btn.disabled = true;
            results.innerHTML = Components.loading();
            try {
                const data = await API.generateMealPlan({
                    calories: parseInt(document.getElementById('plan-calories').value),
                    diet: document.getElementById('plan-diet').value,
                    time_frame: document.getElementById('plan-timeframe').value,
                    exclude: document.getElementById('plan-exclude').value
                });
                results.innerHTML = Components.mealPlanResult(data.plan);
                results.querySelectorAll('.meal-plan-meal[data-id]').forEach(m => {
                    m.addEventListener('click', () => { window.location.hash = `#/recipe/${m.dataset.id}`; });
                });
            } catch(err) {
                let errorMsg = err.message;
                if (errorMsg.includes('500') || errorMsg.includes('502')) {
                    errorMsg = "Spoonacular couldn't generate a meal plan with these strict rules. Try removing some exclusions or changing your calorie target!";
                }
                results.innerHTML = Components.emptyState('⚠️', 'Could not generate plan', errorMsg);
            }
            btn.textContent = '🗓️ Generate Meal Plan'; btn.disabled = false;
        });
    },

    // ── Logout ────────────────────────────────────────────────────────────────
    async logout() {
        try {
            await API.logout();
            this.currentUser = null; this.ingredients = [];
            this.updateAuthUI();
            showToast('Logged out', 'info');
            window.location.hash = '#/login';
            this.handleRoute();
        } catch(err) { showToast(err.message, 'error'); }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
