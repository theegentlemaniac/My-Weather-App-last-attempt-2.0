// Initialize map variables
let map;
let marker;

// Function to initialize the map
function initializeMap() {
  // Initialize the map centered at a default location (e.g., Cape Town, South Africa)
  map = L.map('map').setView([-33.9249, 18.4241], 10);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add a marker to the default location
  marker = L.marker([-33.9249, 18.4241]).addTo(map);
}

// Function to update the map with new coordinates
function updateMap(lat, lon) {
  // Update the map's view and marker position
  map.setView([lat, lon], 10);
  marker.setLatLng([lat, lon]);
}

// Function to get weather data by city
function getWeather() {
  const apiKey = "2ffda2bc6652d34e1283befd1fcc6db4";
  const city = document.getElementById("city").value;

  if (!city) {
    alert("Please enter a city");
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

  // Fetch current weather
  fetch(currentWeatherUrl)
    .then((response) => response.json())
    .then((data) => {
      updateCurrentWeather(data);

      // Update the map with the location's coordinates
      const { lat, lon } = data.coord;
      updateMap(lat, lon);
    })
    .catch((error) => {
      console.error("Error fetching current weather:", error);
      alert("Could not fetch current weather. Please try again.");
    });

  // Fetch forecast
  fetch(forecastUrl)
    .then((response) => response.json())
    .then((data) => updateForecast(data.list))
    .catch((error) => {
      console.error("Error fetching forecast:", error);
      alert("Could not fetch forecast. Please try again.");
    });

  // Update South African time and date
  updateSouthAfricanTimeAndDate();
}

// Function to update the current weather
function updateCurrentWeather(data) {
  if (data.cod === "404") {
    alert(data.message);
    return;
  }

  // Update current weather details
  document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
  document.getElementById("temperature").innerText = `${Math.round(data.main.temp - 273.15)}°C`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("humidity").innerText = `${data.main.humidity}%`;
  document.getElementById("wind-speed").innerText = `${data.wind.speed} m/s`;
  document.getElementById("precipitation").innerText = `${data.clouds.all}%`;

  // Update weather icon
  const iconCode = data.weather[0].icon;
  document.getElementById("weather-icon").style.backgroundImage = `url(https://openweathermap.org/img/wn/${iconCode}@2x.png)`;
}

// Function to update the forecast
function updateForecast(forecast) {
  const daysList = document.getElementById("forecast");
  daysList.innerHTML = ""; // Clear old forecast

  const dailyData = forecast.filter((item, index) => index % 8 === 0); // Every 8th data point (approx. one per day)

  dailyData.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = Math.round(day.main.temp - 273.15);
    const iconCode = day.weather[0].icon;

    const forecastItem = `
      <li>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${day.weather[0].description}">
        <span>${dayName}</span>
        <span class="day-temp">${temp}°C</span>
      </li>
    `;
    daysList.innerHTML += forecastItem;
  });
}

// Function to update South African time and date
function updateSouthAfricanTimeAndDate() {
  const updateTime = () => {
    const now = new Date();
    const southAfricaOffset = 2; // SAST is UTC+2
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const southAfricanTime = new Date(utc + southAfricaOffset * 3600000);

    // Format day
    const dayName = southAfricanTime.toLocaleDateString("en-US", { weekday: "long" });
    document.getElementById("day").innerText = dayName;

    // Format date
    const date = southAfricanTime.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    document.getElementById("date").innerText = date;

    // Format time
    const formattedTime = southAfricanTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    document.getElementById("time").innerText = formattedTime;
  };

  updateTime();
  setInterval(updateTime, 1000); // Update the time every second
}

// Function to locate the user's current position
function locateUser() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Update the map and marker with the user's location
        updateMap(lat, lon);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check your browser settings.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Add a button or call `locateUser()` on page load if you want to auto-detect location
document.getElementById("locate-btn").addEventListener("click", locateUser);

// Initialize the map and time on page load
initializeMap();
updateSouthAfricanTimeAndDate();
