const form = document.getElementById('weather-form');
const input = document.getElementById('city-input');
const result = document.getElementById('result');

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
  if (!data.current_weather) throw new Error('Dados meteorológicos indisponíveis.');
  return data.current_weather;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = input.value.trim();

  if (!city) {
    result.textContent = 'Digite o nome de uma cidade.';
    return;
  }

  result.textContent = 'Buscando clima...';

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(location.latitude, location.longitude);

    result.innerHTML = `
      <strong>${location.name}, ${location.country}</strong><br>
      Temperatura atual: ${weather.temperature.toFixed(1)}°C<br>
      Condição (código): ${weather.weathercode} <small>(valor do Open-Meteo)</small>
    `;
  } catch (error) {
    console.error(error);
    result.innerHTML = `<span class="error">Erro: ${error.message}</span>`;
  }
});
