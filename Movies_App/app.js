const API_KEY = 'a1d54b40624527badb9befc74378ecba';  // Your API key
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMWQ1NGI0MDYyNDUyN2JhZGI5YmVmYzc0Mzc4ZWNiYSIsIm5iZiI6MTczMTU2NjU2NC4wMDg4MTc0LCJzdWIiOiI2NzM1OWFhODdkZmE5NzUxODg2ZTE2M2QiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.th0lQWlR7d4gOSDhtjDi6OSDUd4N3mMAQVhdp7_qAA0';  // Your access token
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let totalPages = 1;
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let currentSort = 'popularity.desc';

const movieDisplay = document.getElementById('movie-display');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const modalWindow = document.getElementById('movie-modal-window');
const closeModalBtn = document.getElementById('close-modal-btn');
const movieInfo = document.getElementById('movie-info');
const watchlistContainer = document.getElementById('watchlist-items');
const watchlistModal = document.getElementById('watchlist-modal-window');
const openListBtn = document.getElementById('open-list');
const closeWatchlistModal = document.getElementById('close-watchlist-modal');
const prevPageBtn = document.getElementById('previous-page');
const nextPageBtn = document.getElementById('next-page');
const sortOptions = document.getElementById('sort-options');

// Function to fetch movies
function fetchMovies(url) {
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`  // Use Bearer token for authenticated requests
        }
    })
        .then(res => res.json())
        .then(data => {
            totalPages = data.total_pages;
            currentPage = data.page;
            displayMovies(data.results);
        });
}

// Function to display movies
function displayMovies(movies) {
    movieDisplay.innerHTML = '';
    movies.forEach(movie => {
        const { title, poster_path, vote_average, release_date, id } = movie;
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-card');
        movieElement.innerHTML = `
            <img src="${poster_path ? IMAGE_URL + poster_path : 'http://via.placeholder.com/500x750'}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span>${vote_average}</span>
            </div>
            <p>Released on: ${release_date}</p>
        `;
        movieElement.addEventListener('click', () => openMovieModal(id));
        movieDisplay.appendChild(movieElement);
    });
}

// Function to open movie details modal
function openMovieModal(movieId) {
    fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,reviews,videos`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(movie => {
            movieInfo.innerHTML = `
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
            `;
            // Кнопка для добавления в Watchlist
            const buttonText = watchlist.some(item => item.id === movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist';
            const buttonAction = watchlist.some(item => item.id === movie.id) ? () => removeFromWatchlist(movie) : () => addToWatchlist(movie);
            
            movieInfo.innerHTML += `
                <button id="add-to-watchlist" class="watchlist-btn">${buttonText}</button>
            `;
            document.getElementById('add-to-watchlist').addEventListener('click', buttonAction);

            modalWindow.style.display = 'block'; // Показываем модальное окно
        });
}

// Close modal
closeModalBtn.addEventListener('click', () => modalWindow.style.display = 'none');

// Search movies
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${currentPage}`;
    fetchMovies(url);
});

// Watchlist Modal
openListBtn.addEventListener('click', () => {
    watchlistModal.style.display = 'block';
    displayWatchlist();
});

closeWatchlistModal.addEventListener('click', () => watchlistModal.style.display = 'none');

// Display watchlist
function displayWatchlist() {
    watchlistContainer.innerHTML = ''; // Очистка текущего списка
    watchlist.forEach(movie => {
        const watchlistItem = document.createElement('div');
        watchlistItem.classList.add('movie-card');
        watchlistItem.innerHTML = `
            <img src="${movie.poster_path ? IMAGE_URL + movie.poster_path : 'http://via.placeholder.com/500x750'}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
            </div>
            <button class="remove-from-watchlist" data-id="${movie.id}">Remove</button>
        `;
        // Добавляем кнопку удаления из watchlist
        const removeButton = watchlistItem.querySelector('.remove-from-watchlist');
        removeButton.addEventListener('click', () => removeFromWatchlist(movie));
        watchlistContainer.appendChild(watchlistItem);
    });


}

// Функция добавления фильма в watchlist
function addToWatchlist(movie) {
    if (!watchlist.some(item => item.id === movie.id)) {
        watchlist.push(movie); // Добавляем фильм в список
        localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Сохраняем в localStorage
    }
}

// Функция для открытия модального окна с подробной информацией о фильме
function openMovieModal(movieId) {
    fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,reviews,videos`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
        .then(res => res.json())
        .then(movie => {
            movieInfo.innerHTML = `
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p><strong>Rating:</strong> ${movie.vote_average}</p>
                <p><strong>Release Date:</strong> ${movie.release_date}</p>
            `;
            // Проверяем, есть ли фильм в watchlist
            const isInWatchlist = watchlist.some(item => item.id === movie.id);
            const buttonText = isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist';
            const buttonAction = isInWatchlist ? () => removeFromWatchlist(movie) : () => addToWatchlist(movie);

            movieInfo.innerHTML += `
                <button id="add-to-watchlist" class="watchlist-btn">${buttonText}</button>
            `;
            // Добавляем обработчик для кнопки
            document.getElementById('add-to-watchlist').addEventListener('click', buttonAction);

            modalWindow.style.display = 'block'; // Открываем модальное окно
        });
}

// Функция для добавления/удаления фильма в/из watchlist
function toggleWatchlist(movie) {
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isInWatchlist) {
        removeFromWatchlist(movie);
    } else {
        addToWatchlist(movie);
    }
}

// Функция удаления фильма из watchlist
function removeFromWatchlist(movie) {
    watchlist = watchlist.filter(item => item.id !== movie.id); // Удаляем фильм из списка
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Сохраняем изменения в localStorage
    displayWatchlist(); // Перерисовываем watchlist
}

// Функция для удаления всех фильмов из watchlist
function removeAllFromWatchlist() {
    watchlist = []; // Очищаем список
    localStorage.setItem('watchlist', JSON.stringify(watchlist)); // Сохраняем изменения в localStorage
    displayWatchlist(); // Перерисовываем watchlist
}

// Функция для закрытия модального окна с фильмом
closeModalBtn.addEventListener('click', () => modalWindow.style.display = 'none');

// Sorting movies
sortOptions.addEventListener('change', event => {
    currentSort = event.target.value;
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${currentSort}&page=${currentPage}`;
    fetchMovies(url);
});

// Pagination controls
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${currentSort}&page=${currentPage}`;
        fetchMovies(url);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${currentSort}&page=${currentPage}`;
        fetchMovies(url);
    }
});

// Initial movie load
fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${currentSort}&page=${currentPage}`);
