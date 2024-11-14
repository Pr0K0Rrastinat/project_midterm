const apiKey = 'ea880f5cf60d3a4ba3d7bd4638293aec';  // Replace with your own API key
let isCelsius = true;  // Flag to toggle between Celsius and Fahrenheit

// Function to fetch city suggestions
function fetchCitySuggestions() {
    const query = document.getElementById('city').value;
    if (!query) return;

    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
        .then(response => response.json())
        .then(suggestions => {
            const suggestionsList = document.getElementById('suggestions-list');
            suggestionsList.innerHTML = '';
            suggestions.forEach(city => {
                const listItem = document.createElement('li');
                listItem.textContent = city.name;
                listItem.onclick = () => {
                    document.getElementById('city').value = city.name;
                    suggestionsList.innerHTML = '';
                };
                suggestionsList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching city suggestions:', error));
}

// Function to get weather for a specific city
function getWeather() {
    const city = document.getElementById('city').value;
    if (!city) {
        alert('Please enter a city');
        return;
    }

    const unit = isCelsius ? 'metric' : 'imperial';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;

    // Fetch current weather
    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(error => alert('Error fetching current weather data. Please try again.'));

    // Fetch 5-day forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(error => alert('Error fetching forecast data. Please try again.'));
}

// Function to display current weather
function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    tempDivInfo.innerHTML = '';
    weatherInfoDiv.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

        tempDivInfo.innerHTML = `<p>${temperature}°${isCelsius ? 'C' : 'F'}</p>`;
        weatherInfoDiv.innerHTML = `
            <p><strong>${data.name}</strong></p>
            <p>${description}</p>
            <p>Humidity: ${data.main.humidity}%</p>
            <p>Wind: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>`;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        weatherIcon.style.display = 'block';
    }
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.innerHTML = '<h3>5-Day Forecast</h3>';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const day = dateTime.toLocaleDateString('en-US', { weekday: 'long' });
        const tempMin = Math.round(item.main.temp_min);
        const tempMax = Math.round(item.main.temp_max);
        const description = item.weather[0].description;
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        forecastDiv.innerHTML += `
            <div class="forecast-item">
                <p>${day}</p>
                <img src="${iconUrl}" alt="${description}">
                <p>${tempMax}° / ${tempMin}° ${isCelsius ? 'C' : 'F'}</p>
                <p>${description}</p>
            </div>`;
    });
}

// Function to get current weather based on user's location
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const unit = isCelsius ? 'metric' : 'imperial';
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`;

            // Fetch weather for user's location
            fetch(url)
                .then(response => response.json())
                .then(data => displayWeather(data))
                .catch(error => alert('Error fetching data: ' + error.message));
        }, error => {
            alert('Unable to retrieve location: ' + error.message);
        });
    } else {
        alert('Your browser does not support geolocation.');
    }
}

// Function to toggle between Celsius and Fahrenheit
function toggleUnit() {
    isCelsius = !isCelsius;
    getWeather();  // Refresh the weather data with the new unit
}
