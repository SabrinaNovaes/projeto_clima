const form = document.getElementById('weather-form');
const input = document.getElementById('city-input');
const result = document.getElementById('result');

function showError(message) {
    result.innerHTML = `<span class="error">${message}</span>`;
}

async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Erro na busca de coordenadas.');

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
        throw new Error('Cidade não encontrada.');
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country,
    };
}

async function getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius&timezone=auto`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Erro na requisição de tempo.');

    const data = await res.json();

    if (!data.current_weather) {
        throw new Error('Dados meteorológicos indisponíveis.');
    }

    return data.current_weather;
}

// 🌤️ descrição
function getWeatherDescription(code) {
    const map = {
        0: "Céu limpo",
        1: "Principalmente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Neblina",
        51: "Garoa leve",
        53: "Garoa moderada",
        55: "Garoa intensa",
        61: "Chuva leve",
        63: "Chuva moderada",
        65: "Chuva forte",
        71: "Neve leve",
        80: "Pancadas de chuva",
        95: "Tempestade"
    };
    return map[code] || "Clima desconhecido";
}

// 🌈 ícones
function getWeatherIcon(code) {
    const map = {
        0: "wi-day-sunny",
        1: "wi-day-sunny",
        2: "wi-day-cloudy",
        3: "wi-cloudy",
        45: "wi-fog",
        51: "wi-sprinkle",
        61: "wi-rain",
        63: "wi-rain",
        65: "wi-rain-wind",
        71: "wi-snow",
        80: "wi-showers",
        95: "wi-thunderstorm"
    };
    return map[code] || "wi-na";
}

// 🌙 tema
function toggleTheme(isDay) {
    if (isDay === 1) {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
}

const homeBtn = document.getElementById("home-btn");

homeBtn.addEventListener("click", () => {
    input.value = "";
    result.innerHTML = "";

    // volta pro tema claro
    document.documentElement.removeAttribute("data-theme");
});

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = input.value.trim();

    if (!city) {
        showError('Digite o nome de uma cidade.');
        return;
    }

    result.textContent = 'Buscando clima...';

    try {
        const location = await getCoordinates(city);
        const weather = await getWeather(location.latitude, location.longitude);

        const description = getWeatherDescription(weather.weathercode);
        const icon = getWeatherIcon(weather.weathercode);

        // 🕒 data da cidade
        const date = new Date(weather.time);

        const formattedDate = date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        const time = date.toLocaleTimeString("pt-BR");

        toggleTheme(weather.is_day);

        result.innerHTML = `
        <div class="weather-card">
            <h2>${location.name}, ${location.country}</h2>
    
            <p class="date">
                ${formattedDate}<br>
                ${time} (horário local)
            </p>

            <div class="weather-icon">
                <i class="wi ${icon}"></i>
            </div>

            <p class="temperature">${weather.temperature.toFixed(1)}°C</p>
            <p class="description">${description}</p>
        </div>
        `;

    } catch (error) {
        console.error(error);

        if (error.message.includes("Cidade")) {
            showError("Cidade não encontrada.");
        } else if (error.message.includes("fetch")) {
            showError("Erro de conexão.");
        } else {
            showError(error.message);
        }
    }
});