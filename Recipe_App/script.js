const apiKey = '5f7edcc1c06145fb9526bc751facc567';
const mealResultsContainer = document.getElementById('mealResults');
const searchInput = document.getElementById('mealSearchInput');
const noResultsMessage = document.getElementById('noResultsMessage');
const suggestionsContainer = document.getElementById('autoCompleteSuggestions');
const favoritesContainer = document.getElementById('favoriteMeals');

document.getElementById('searchButton').addEventListener('click', searchMeals);
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    displayRandomMeals();
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length < 2) {
        suggestionsContainer.innerHTML = '';  // Очистить подсказки, если введено менее 2 символов
        return;
    }
    fetchSuggestions(query);
});

function fetchSuggestions(query) {
    fetch(`https://api.spoonacular.com/recipes/autocomplete?number=5&query=${query}&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = data.map(item => `<a href="#" class="list-group-item list-group-item-action" onclick="chooseSuggestion('${item.title}')">${item.title}</a>`).join('');
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}

function chooseSuggestion(title) {
    searchInput.value = title;
    suggestionsContainer.innerHTML = '';  // Скрыть подсказки после выбора
    searchMeals();  // Запустить поиск рецептов
}

function searchMeals() {
    const query = searchInput.value;
    if (!query.trim()) {
        noResultsMessage.style.display = 'none';
        mealResultsContainer.innerHTML = '';
        return;
    }

    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            mealResultsContainer.innerHTML = '';
            if (data.results.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
                displayRecipes(data.results);
            }
        })
        .catch(error => {
            console.error('Error fetching meals:', error);
            noResultsMessage.style.display = 'block';
            noResultsMessage.innerHTML = 'Error fetching meals. Try again later.';
        });

    // Скрыть подсказки при нажатии на кнопку поиска
    suggestionsContainer.innerHTML = '';
}

function displayRecipes(recipes) {
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'card';
        recipeCard.innerHTML = `
            <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
            <div class="card-body">
                <h5 class="card-title">${recipe.title}</h5>
                <button class="btn btn-outline-primary" onclick="viewRecipeDetails(${recipe.id})" data-bs-toggle="modal" data-bs-target="#recipeDetailModal">Details</button>
                <button class="btn btn-warning mt-2" onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Favorites</button>
            </div>
        `;
        mealResultsContainer.appendChild(recipeCard);
    });
}

function viewRecipeDetails(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(recipe => {
            document.getElementById('recipeDetailsContent').innerHTML = `
                <img src="${recipe.image}" class="img-fluid mb-3" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
                <p>${recipe.summary}</p>
                <h5>Ingredients</h5>
                <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
                <h5>Instructions</h5>
                <p>${recipe.instructions}</p>
                <h5>Nutrition</h5>
                <p>Calories: ${recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount} kcal</p>
            `;
        })
        .catch(error => console.error('Error fetching recipe details:', error));
}

function addToFavorites(id, title, image) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === id)) {
        favorites.push({ id, title, image });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
    }
}

function loadFavorites() {
    favoritesContainer.innerHTML = '';
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(fav => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${fav.image}" class="card-img-top" alt="${fav.title}">
            <div class="card-body">
                <h5 class="card-title">${fav.title}</h5>
                <button class="btn btn-outline-primary" onclick="viewRecipeDetails(${fav.id})" data-bs-toggle="modal" data-bs-target="#recipeDetailModal">Details</button>
                <button class="btn btn-danger mt-2" onclick="removeFromFavorites(${fav.id})">Remove</button>
            </div>
        `;
        favoritesContainer.appendChild(card);
    });
}

function removeFromFavorites(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadFavorites();
}

function displayRandomMeals() {
    fetch('https://api.spoonacular.com/recipes/random?number=4&apiKey=' + apiKey)
        .then(response => response.json())
        .then(data => {
            const randomMealsContainer = document.getElementById('randomMeals');
            randomMealsContainer.innerHTML = data.recipes.map(recipe => `
                <div class="card" style="width: 18rem;">
                    <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                    <div class="card-body">
                        <h5 class="card-title">${recipe.title}</h5>
                        <button class="btn btn-outline-primary" onclick="viewRecipeDetails(${recipe.id})" data-bs-toggle="modal" data-bs-target="#recipeDetailModal">Details</button>
                        <button class="btn btn-warning mt-2" onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Favorites</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error fetching random meals:', error));
}

