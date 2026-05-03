/* ===== UI Component Renderers ===== */

const Components = {

    loading() {
        return `<div class="loading"><div class="spinner"></div><p>Finding delicious recipes...</p></div>`;
    },

    emptyState(icon, title, message) {
        return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${message}</p></div>`;
    },

    /* ===== Landing Page ===== */
    landingPage(mode = 'login') {
        const isRegister = mode === 'register';
        const formHtml = isRegister ? `
            <div class="auth-card">
                <h2>Join Recipe Finder</h2>
                <p class="auth-subtitle">Create your account and start exploring</p>
                <form id="register-form">
                    <div class="form-group"><label for="reg-name">Full Name</label><input type="text" id="reg-name" placeholder="Your name" required autocomplete="name"></div>
                    <div class="form-group"><label for="reg-email">Email Address</label><input type="email" id="reg-email" placeholder="you@example.com" required autocomplete="email"></div>
                    <div class="form-group"><label for="reg-password">Password</label><input type="password" id="reg-password" placeholder="Min 6 characters" required minlength="6"></div>
                    <button type="submit" class="btn btn-primary btn-lg">Create Account</button>
                </form>
                <div class="auth-footer">Already have an account? <a href="#/login">Sign in</a></div>
            </div>` : `
            <div class="auth-card">
                <h2>Welcome Back</h2>
                <p class="auth-subtitle">Sign in to access your recipes and favorites</p>
                <form id="login-form">
                    <div class="form-group"><label for="login-email">Email Address</label><input type="email" id="login-email" placeholder="you@example.com" required autocomplete="email"></div>
                    <div class="form-group"><label for="login-password">Password</label><input type="password" id="login-password" placeholder="Your password" required></div>
                    <button type="submit" class="btn btn-primary btn-lg">Sign In</button>
                </form>
                <div class="auth-footer">Don't have an account? <a href="#/register">Create one free</a></div>
            </div>`;

        return `<div class="landing-page">
            <div class="landing-bg"></div>
            <div class="landing-container">
                <div class="landing-info">
                    <h1>Cook More.<br><span class="highlight">Waste Less.</span><br>Eat Better.</h1>
                    <p>Enter the ingredients you have at home and discover hundreds of recipes you can make right now — personalised, filtered, and saved just for you.</p>
                    <div class="landing-features">
                        <div class="landing-feature">
                            <span class="feat-icon feat-red">🍳</span>
                            <span>Search by ingredients already in your kitchen</span>
                        </div>
                        <div class="landing-feature">
                            <span class="feat-icon feat-olive">🥗</span>
                            <span>Filter by diet, cuisine, and cooking time</span>
                        </div>
                        <div class="landing-feature">
                            <span class="feat-icon feat-mustard">⭐</span>
                            <span>Save favorites and revisit past searches</span>
                        </div>
                    </div>
                </div>
                ${formHtml}
            </div>
        </div>`;
    },

    /* ===== Home Page (logged in) ===== */
    home(userName) {
        const heroImages = [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80',
            'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400&q=80',
            'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
        ];
        const img = heroImages[Math.floor(Math.random() * heroImages.length)];

        return `
        <section class="hero">
            <div class="hero-bg">
                <img src="${img}" alt="Food" loading="eager">
                <div></div>
            </div>
            <div class="hero-content">
                <h1>Hey ${sanitize(userName)}, <span class="highlight">what's cooking?</span></h1>
                <p>Add your ingredients below and we'll find what you can make</p>
            </div>
        </section>
        <section class="search-section">
            <div class="search-box">
                <div class="search-input-group">
                    <input type="text" class="search-input" id="ingredient-input"
                        placeholder="🥕 Type an ingredient (e.g. chicken, tomato, rice)..." autocomplete="off">
                    <button class="btn btn-primary" id="add-ingredient-btn">+ Add</button>
                </div>
                <div class="ingredient-tags" id="ingredient-tags"></div>
                <div class="filters-row">
                    <select class="filter-select" id="filter-diet">
                        <option value="">🥦 Any Diet</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="gluten free">Gluten Free</option>
                        <option value="ketogenic">Ketogenic</option>
                        <option value="paleo">Paleo</option>
                    </select>
                    <select class="filter-select" id="filter-cuisine">
                        <option value="">🌍 Any Cuisine</option>
                        <option value="indian">🇮🇳 Indian</option>
                        <option value="italian">🇮🇹 Italian</option>
                        <option value="chinese">🇨🇳 Chinese</option>
                        <option value="mexican">🇲🇽 Mexican</option>
                        <option value="american">🇺🇸 American</option>
                        <option value="thai">🇹🇭 Thai</option>
                        <option value="japanese">🇯🇵 Japanese</option>
                        <option value="mediterranean">Mediterranean</option>
                        <option value="french">🇫🇷 French</option>
                    </select>
                    <select class="filter-select" id="filter-type">
                        <option value="">🍽️ Any Meal</option>
                        <option value="breakfast">☀️ Breakfast</option>
                        <option value="main course">🍖 Main Course</option>
                        <option value="side dish">🥗 Side Dish</option>
                        <option value="dessert">🍰 Dessert</option>
                        <option value="snack">🥨 Snack</option>
                        <option value="soup">🍲 Soup</option>
                        <option value="salad">🥙 Salad</option>
                    </select>
                    <select class="filter-select" id="filter-time">
                        <option value="">⏱️ Any Time</option>
                        <option value="15">Under 15 min</option>
                        <option value="30">Under 30 min</option>
                        <option value="60">Under 1 hour</option>
                        <option value="120">Under 2 hours</option>
                    </select>
                    <select class="filter-select" id="filter-intolerance">
                        <option value="">🚫 No Intolerances</option>
                        <option value="dairy">Dairy Free</option>
                        <option value="egg">Egg Free</option>
                        <option value="gluten">Gluten Free</option>
                        <option value="peanut">Peanut Free</option>
                        <option value="seafood">Seafood Free</option>
                        <option value="shellfish">Shellfish Free</option>
                        <option value="soy">Soy Free</option>
                        <option value="tree nut">Tree Nut Free</option>
                        <option value="wheat">Wheat Free</option>
                    </select>
                    <select class="filter-select" id="filter-sort">
                        <option value="">⬆️ Sort By</option>
                        <option value="popularity">🔥 Popularity</option>
                        <option value="healthiness">💚 Healthiness</option>
                        <option value="time">⏱ Cook Time</option>
                        <option value="calories">🔥 Calories</option>
                        <option value="price">💰 Price</option>
                        <option value="random">🎲 Random</option>
                    </select>
                </div>
                <div style="display:flex;gap:0.6rem">
                    <button class="btn btn-primary btn-lg" id="search-btn" style="flex:1">🔍 Find Recipes</button>
                    <button class="btn btn-ghost btn-sm" id="extract-url-btn" title="Import recipe from any URL">🔗 Import URL</button>
                </div>
            </div>
        </section>
        <section class="section-container" id="results-section" style="display:none">
            <div class="section-header">
                <div>
                    <div class="section-divider"></div>
                    <h2 class="section-title" id="results-title">Results</h2>
                </div>
            </div>
            <div class="recipe-grid" id="results-grid"></div>
        </section>
        <section class="section-container" id="featured-section">
            <div class="section-header">
                <div>
                    <div class="section-divider"></div>
                    <h2 class="section-title">✨ Trending Recipes</h2>
                </div>
            </div>
            <div class="recipe-grid" id="featured-grid"></div>
        </section>`;
    },

    /* ===== Recipe Card ===== */
    recipeCard(recipe, index = 0) {
        const imgHtml = recipe.image
            ? `<img src="${recipe.image}" alt="${sanitize(recipe.title)}" loading="lazy">`
            : `<div class="recipe-card-image-placeholder">🍽️</div>`;

        const timeLabel = recipe.readyInMinutes ? `⏱ ${formatTime(recipe.readyInMinutes)}` : '';
        const servings = recipe.servings ? `👥 ${recipe.servings}` : '';
        const likes = recipe.likes ? `❤️ ${recipe.likes}` : '';

        let tags = '';
        if (recipe.diets?.length) tags += recipe.diets.slice(0,2).map(d=>`<span class="tag tag-diet">${d}</span>`).join('');
        if (recipe.cuisines?.length) tags += recipe.cuisines.slice(0,1).map(c=>`<span class="tag tag-cuisine">${c}</span>`).join('');

        let matchInfo = '';
        if (recipe.usedIngredientCount !== undefined) {
            const total = (recipe.usedIngredientCount||0) + (recipe.missedIngredientCount||0);
            const pct = total > 0 ? Math.round((recipe.usedIngredientCount/total)*100) : 0;
            // Feature 2 — missed ingredients pills
            const missed = (recipe.missedIngredients||[]);
            const missedHtml = missed.length ? `<div class="missed-ingredients">
                <span style="font-size:0.7rem;color:var(--text-m)">Missing:</span>
                ${missed.map(m => `<span class="missed-ing">${m.image?`<img src="${m.image}" alt="">`:''} ${sanitize(m.name)}</span>`).join('')}
            </div>` : '';
            matchInfo = `<div class="recipe-card-match">
                ${recipe.usedIngredientCount}/${total} matched
                <div class="match-bar"><div class="match-bar-fill" style="width:${pct}%"></div></div>
                ${missedHtml}
            </div>`;
        }

        return `<article class="recipe-card" data-recipe-id="${recipe.id}" style="animation-delay:${index*0.05}s">
            <div class="recipe-card-image">
                ${imgHtml}
                <div class="recipe-card-overlay"></div>
                ${timeLabel ? `<div class="recipe-card-badge">${timeLabel}</div>` : ''}
            </div>
            <div class="recipe-card-body">
                <h3 class="recipe-card-title">${sanitize(recipe.title)}</h3>
                <div class="recipe-card-meta">
                    ${servings ? `<span>${servings}</span>` : ''}
                    ${likes ? `<span>${likes}</span>` : ''}
                </div>
                ${tags ? `<div class="recipe-card-tags">${tags}</div>` : ''}
                ${matchInfo}
            </div>
        </article>`;
    },

    /* ===== Recipe Detail ===== */
    recipeDetail(recipe, isFav = false) {
        const ingredients = (recipe.ingredients||[]).map(i=>`<li>${sanitize(i.original||i.name||'')}</li>`).join('');
        const steps = (recipe.instructions||[]).map(s=>`<li>${sanitize(s.step||'')}</li>`).join('');

        const diets = [...(recipe.diets||[])];
        if (recipe.vegetarian && !diets.includes('vegetarian')) diets.push('vegetarian');
        if (recipe.vegan && !diets.includes('vegan')) diets.push('vegan');
        if (recipe.glutenFree && !diets.includes('gluten free')) diets.push('gluten free');

        const dietTags = diets.length
            ? `<div class="recipe-card-tags" style="margin-top:0.5rem">
                ${diets.map(d=>`<span class="tag tag-diet">${d}</span>`).join('')}
                ${(recipe.cuisines||[]).map(c=>`<span class="tag tag-cuisine">${c}</span>`).join('')}
               </div>`
            : '';

        const heroImg = recipe.image
            ? `<img src="${recipe.image}" alt="${sanitize(recipe.title)}">`
            : `<div style="height:420px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-size:4rem">🍽️</div>`;

        return `<div class="recipe-detail">
            <a href="#/" class="back-btn">← Back to search</a>
            <div class="recipe-detail-hero">
                ${heroImg}
                <div class="recipe-detail-hero-content">
                    <h1>${sanitize(recipe.title)}</h1>
                    ${dietTags}
                    <div class="recipe-detail-actions" style="margin-top:0.75rem">
                        <button class="fav-btn ${isFav?'active':''}" id="fav-detail-btn"
                            data-id="${recipe.id}" data-title="${sanitize(recipe.title)}" data-image="${recipe.image||''}">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                        ${recipe.sourceUrl ? `<a href="${recipe.sourceUrl}" target="_blank" class="btn btn-ghost btn-sm">View Source ↗</a>` : ''}
                    </div>
                </div>
            </div>
            <div class="recipe-meta-grid">
                <div class="meta-item"><div class="meta-value">${formatTime(recipe.readyInMinutes)}</div><div class="meta-label">⏱ Cook Time</div></div>
                <div class="meta-item"><div class="meta-value">${recipe.servings||'–'}</div><div class="meta-label">👥 Servings</div></div>
                <div class="meta-item"><div class="meta-value">${recipe.healthScore||'–'}</div><div class="meta-label">💚 Health Score</div></div>
                <div class="meta-item"><div class="meta-value">${recipe.likes||0}</div><div class="meta-label">❤️ Likes</div></div>
            </div>
            ${recipe.summary ? `<div class="recipe-section"><h2>About</h2><div class="recipe-summary">${recipe.summary}</div></div>` : ''}
            ${ingredients ? `<div class="recipe-section"><h2>Ingredients</h2>
                <ul class="ingredients-list">
                    ${(recipe.ingredients||[]).map(i => `<li>
                        ${sanitize(i.original||i.name||'')}
                        <button class="sub-btn btn btn-ghost btn-sm" data-ingredient="${sanitize(i.name||'')}" style="margin-left:auto;font-size:0.7rem;padding:0.15rem 0.5rem" title="Find substitutes">Sub?</button>
                    </li>`).join('')}
                </ul>
            </div>` : ''}
            <div class="recipe-section"><h2>Instructions</h2>
                ${steps
                    ? `<ol class="instructions-list">${steps}</ol>`
                    : `<p style="color:var(--text-m)">Full instructions available at <a href="${recipe.sourceUrl||'#'}" target="_blank">the source</a>.</p>`}
            </div>
            ${recipe.nutrition && Object.keys(recipe.nutrition).length ? `
            <div class="recipe-section">
                <h2>Nutrition</h2>
                <div class="nutrition-panel">
                    <div class="nutrition-grid">
                        ${Object.entries(recipe.nutrition).map(([k,v]) => `
                            <div class="nutrition-item">
                                <div class="nutrition-value">${v.amount}${v.unit}</div>
                                <div class="nutrition-label">${k}</div>
                            </div>`).join('')}
                    </div>
                </div>
                <div id="nutrition-label-container" style="margin-top:0.75rem"></div>
            </div>` : `<div id="nutrition-label-container"></div>`}
            <div id="similar-section"></div>
        </div>`;
    },

    /* ===== Favorites Page ===== */
    favoritesPage(favorites) {
        if (!favorites?.length) {
            return `<div class="page-header"><h1>❤️ Your Favorites</h1><p>Recipes you've saved for later</p></div>
                <div class="section-container">${this.emptyState('🔖','No favorites yet','Search for recipes and tap ❤️ to save them here.')}</div>`;
        }
        const cards = favorites.map((f,i) => `
            <article class="recipe-card" data-recipe-id="${f.recipe_id}" style="animation-delay:${i*0.05}s">
                <div class="recipe-card-image">
                    ${f.recipe_image
                        ? `<img src="${f.recipe_image}" alt="${sanitize(f.recipe_title)}" loading="lazy">`
                        : `<div class="recipe-card-image-placeholder">🍽️</div>`}
                    <div class="recipe-card-overlay"></div>
                </div>
                <div class="recipe-card-body">
                    <h3 class="recipe-card-title">${sanitize(f.recipe_title)}</h3>
                    <div class="recipe-card-meta"><span>Saved ${formatDate(f.saved_at)}</span></div>
                    <button class="btn btn-danger btn-sm remove-fav-btn" data-recipe-id="${f.recipe_id}" style="margin-top:0.6rem;width:100%">Remove</button>
                </div>
            </article>`).join('');
        return `<div class="page-header"><h1>❤️ Your Favorites</h1><p>Recipes you've saved for later</p></div>
            <div class="section-container"><div class="recipe-grid">${cards}</div></div>`;
    },

    /* ===== History Page ===== */
    historyPage(history) {
        if (!history?.length) {
            return `<div class="page-header"><h1>📜 Search History</h1><p>Your recent searches</p></div>
                <div class="section-container">${this.emptyState('🔍','No search history','Your ingredient searches will appear here.')}</div>`;
        }
        const items = history.map(h => {
            const filters = h.filters_applied || {};
            const filterTags = Object.entries(filters).filter(([,v])=>v)
                .map(([k,v])=>`<span class="tag tag-cuisine">${k}: ${v}</span>`).join('');
            return `<div class="history-item" data-query="${sanitize(h.query_text)}">
                <div>
                    <div class="history-query">🔍 ${sanitize(h.query_text)}</div>
                    <div class="history-meta">${h.result_count} results · ${formatDate(h.searched_at)}</div>
                    ${filterTags ? `<div class="history-filters">${filterTags}</div>` : ''}
                </div>
                <span style="color:var(--text-m);font-size:1.1rem">›</span>
            </div>`;
        }).join('');
        return `<div class="page-header"><h1>📜 Search History</h1><p>Click any search to run it again</p></div>
            <div class="section-container">
                <div class="history-list">${items}</div>
                <div style="text-align:center;margin-top:1.25rem">
                    <button class="btn btn-danger btn-sm" id="clear-history-btn">🗑 Clear All History</button>
                </div>
            </div>`;
    },

    /* ===== Feature 9 — Meal Plan Result ===== */
    mealPlanResult(plan) {
        if (!plan) return this.emptyState('⚠️','No plan generated','Try adjusting your preferences.');
        // day plan
        if (plan.meals) {
            const meals = plan.meals;
            const nutrients = plan.nutrients || {};
            return `<div style="margin-top:1.5rem">
                <div class="meal-plan-day">
                    <div class="meal-plan-day-header">📅 Today's Meal Plan</div>
                    ${meals.map(m => `
                        <div class="meal-plan-meal" data-id="${m.id}">
                            <img src="https://img.spoonacular.com/recipes/${m.id}-90x90.jpg" alt="${sanitize(m.title)}" loading="lazy">
                            <div class="meal-plan-meal-info">
                                <div class="meal-plan-meal-title">${sanitize(m.title)}</div>
                                <div class="meal-plan-meal-meta">⏱ ${formatTime(m.readyInMinutes)} · 👥 ${m.servings} servings</div>
                            </div>
                        </div>`).join('')}
                </div>
                <div class="meal-plan-nutrients">
                    <span>🔥 <b>${Math.round(nutrients.calories||0)} kcal</b></span>
                    <span>🥩 Protein <b>${Math.round(nutrients.protein||0)}g</b></span>
                    <span>🧈 Fat <b>${Math.round(nutrients.fat||0)}g</b></span>
                    <span>🍞 Carbs <b>${Math.round(nutrients.carbohydrates||0)}g</b></span>
                </div>
            </div>`;
        }
        // week plan
        if (plan.week) {
            const days = Object.entries(plan.week);
            return `<div style="margin-top:1.5rem"><div class="meal-plan-grid">
                ${days.map(([day, info]) => `
                    <div class="meal-plan-day">
                        <div class="meal-plan-day-header">📅 ${day.charAt(0).toUpperCase()+day.slice(1)}</div>
                        ${(info.meals||[]).map(m => `
                            <div class="meal-plan-meal" data-id="${m.id}">
                                <img src="https://img.spoonacular.com/recipes/${m.id}-90x90.jpg" alt="" loading="lazy">
                                <div class="meal-plan-meal-info">
                                    <div class="meal-plan-meal-title">${sanitize(m.title)}</div>
                                    <div class="meal-plan-meal-meta">⏱ ${formatTime(m.readyInMinutes)}</div>
                                </div>
                            </div>`).join('')}
                        <div class="meal-plan-nutrients">
                            <span>🔥 <b>${Math.round((info.nutrients||{}).calories||0)} kcal</b></span>
                        </div>
                    </div>`).join('')}
            </div></div>`;
        }
        return this.emptyState('📅','Plan ready','Check your meals above.');
    }
};
