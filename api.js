/**
 * @fileoverview Módulo de consulta de clima usando APIs externas (Open-Meteo e Geocoding).
 * Contém funções para validar cidade, buscar coordenadas, obter clima atual, gerar descrições e ícones,
 * alternar tema dia/noite e exibir mensagens de erro no DOM.
 *
 * Elementos DOM integrados:
 *  - Formulário: #weather-form
 *  - Input cidade: #city-input
 *  - Resultado: #result
 *  - Botão Home: #home-btn
 *
 * Exemplo de uso assíncrono:
 * @example
 * const cidade = "Rio de Janeiro";
 * try {
 *   validarCidade(cidade);
 *   const location = await getCoordinates(cidade);
 *   const weather = await getWeather(location.latitude, location.longitude);
 *   const descricao = getWeatherDescription(weather.weathercode);
 *   const icone = getWeatherIcon(weather.weathercode);
 *   console.log(`Clima em ${location.name}, ${location.country}: ${descricao}, ${weather.temperature}°C`);
 * } catch (error) {
 *   console.error(error.message);
 * }
 */

const form = document.getElementById('weather-form');
const input = document.getElementById('city-input');
const result = document.getElementById('result');
const homeBtn = document.getElementById('home-btn');

/**
 * Exibe uma mensagem de erro na tela.
 *
 * @param {string} message - Mensagem de erro a ser exibida.
 */
function showError(message) {
    result.innerHTML = `<span class="error">${message}</span>`;
}

/**
 * Valida o nome da cidade informado pelo usuário.
 *
 * @param {string} cidade - Nome da cidade.
 * @throws {Error} Se a cidade for vazia ou inválida.
 */
function validarCidade(cidade) {
    if (!cidade || typeof cidade !== 'string' || cidade.trim() === '') {
        throw new Error('Digite o nome de uma cidade.');
    }
}

/**
 * Busca coordenadas geográficas de uma cidade.
 *
 * @async
 * @param {string} city - Nome da cidade.
 * @returns {Promise<{latitude: number, longitude: number, name: string, country: string}>}
 * @throws {Error} Se a conexão falhar, cidade não encontrada ou resposta inválida.
*/
async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    let res;
    try {
        res = await fetch(url);
    } catch {
        throw new Error('Erro de conexão ao buscar coordenadas.');
    }

    if (!res.ok) throw new Error(`Erro na busca de coordenadas. Código: ${res.status}`);

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error('Resposta inválida da API de coordenadas.');
    }

    if (!data.results || data.results.length === 0) {
        throw new Error('Cidade não encontrada.');
    }

    const loc = data.results[0];
    return { latitude: loc.latitude, longitude: loc.longitude, name: loc.name, country: loc.country };
}

/**
 * Obtém o clima atual da Open-Meteo incluindo dados extras e dados diários.
 *
 * @async
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{current: Object, daily: Object}>}
 * @throws {Error} Se a conexão falhar, resposta inválida ou dados indisponíveis.
 */
async function getWeather(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,is_day&timezone=auto&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max`;
    let res;
    try {
        res = await fetch(url);
    } catch {
        throw new Error('Erro de conexão ao buscar clima.');
    }

    if (!res.ok) throw new Error(`Erro na requisição de clima. Código: ${res.status}`);

    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error('Resposta inválida da API de clima.');
    }

    if (!data.current || !data.daily) throw new Error('Dados meteorológicos indisponíveis.');

    return {
        current: data.current,
        daily: data.daily
    };
}

// ===============================
// CACHE
// ===============================

/**
 * Tempo de validade do cache (10 minutos)
 * @type {number}
 */
const CACHE_DURATION = 10 * 60 * 1000;

/**
 * Obtém dados do cache.
 * @param {string} city
 * @returns {Object|null}
 */
function getCache(city) {
    const key = city.toLowerCase();
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
        localStorage.removeItem(key);
        return null;
    }

    return parsed.data;
}

/**
 * Salva dados no cache.
 * @param {string} city
 * @param {Object} data
 */
function setCache(city, data) {
    const key = city.toLowerCase();

    const payload = {
        data,
        timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(payload));
}

/**
 * Retorna descrição textual do clima.
 *
 * @param {number} code - Código do clima da API.
 * @returns {string} Descrição do clima.
 */
function getWeatherDescription(code) {
    const map = {
        0: "Céu limpo", 1: "Principalmente limpo", 2: "Parcialmente nublado", 3: "Nublado",
        45: "Neblina", 48: "Geada", 51: "Garoa leve", 53: "Garoa moderada", 55: "Garoa intensa",
        61: "Chuva leve", 63: "Chuva moderada", 65: "Chuva forte",
        66: "Chuva congelante leve", 67: "Chuva congelante forte",
        71: "Neve leve", 73: "Neve moderada", 75: "Neve intensa",
        77: "Granizo", 80: "Pancadas de chuva", 81: "Pancadas de chuva fortes",
        82: "Pancadas de chuva muito fortes", 85: "Neve leve", 86: "Neve intensa",
        95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade severa"
    };
    return map[code] || "Clima desconhecido";
}

/**
 * Retorna classe CSS do ícone correspondente ao clima.
 *
 * @param {number} code
 * @returns {string} Classe CSS do ícone.
 */
function getWeatherIcon(code) {
    const map = {
        0: "wi-day-sunny", 1: "wi-day-sunny", 2: "wi-day-cloudy", 3: "wi-cloudy",
        45: "wi-fog", 48: "wi-snow", 51: "wi-sprinkle", 53: "wi-sprinkle", 55: "wi-sprinkle",
        61: "wi-rain", 63: "wi-rain", 65: "wi-rain-wind", 66: "wi-rain-mix", 67: "wi-rain-mix",
        71: "wi-snow", 73: "wi-snow", 75: "wi-snow", 77: "wi-hail",
        80: "wi-showers", 81: "wi-showers", 82: "wi-showers", 85: "wi-snow", 86: "wi-snow",
        95: "wi-thunderstorm", 96: "wi-thunderstorm", 99: "wi-thunderstorm"
    };
    return map[code] || "wi-na";
}

/**
 * Alterna tema da página entre claro e escuro.
 *
 * @param {number} isDay - 1 para dia, 0 para noite.
 */
function toggleTheme(isDay) {
    if (isDay === 1) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "dark");
}

/**
 * Listener do botão Home (#home-btn).
 *
 * Função de reset do formulário e interface:
 * 1. Limpa o valor do input de cidade.
 * 2. Remove conteúdo do resultado exibido.
 * 3. Retorna o tema da página para o modo claro.
 *
 * @param {MouseEvent} event - Evento de clique no botão Home.
 * @returns {void}
 * @example
 * // Ao clicar no botão Home:
 * // - input.value é limpo
 * // - resultado.innerHTML é limpo
 * // - tema da página volta para claro
 */

// Botão Home
homeBtn.addEventListener("click", () => {
    input.value = "";
    result.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
});

/**
 * Listener do envio do formulário de cidade (#weather-form).
 *
 * Executa o fluxo completo de busca do clima:
 * 1. Previne o comportamento padrão do submit.
 * 2. Valida o input da cidade.
 * 3. Exibe mensagem de "Buscando clima...".
 * 4. Consulta as coordenadas da cidade via getCoordinates().
 * 5. Consulta o clima atual via getWeather().
 * 6. Obtém a descrição e ícone do clima via getWeatherDescription() e getWeatherIcon().
 * 7. Formata data e hora locais da cidade.
 * 8. Alterna o tema da página conforme dia/noite.
 * 9. Atualiza o DOM com card meteorológico contendo:
 *    - Nome da cidade e país
 *    - Data e hora
 *    - Ícone do clima
 *    - Temperatura
 *    - Descrição
 * 10. Trata erros exibindo mensagens apropriadas no DOM.
 *
 * @async
 * @param {SubmitEvent} event - Evento de envio do formulário.
 * @returns {Promise<void>}
 * @throws {Error} Se a cidade for inválida ou ocorrer falha de conexão ou dados meteorológicos.
 *
 * @example
 * // Usuário digita "Rio de Janeiro" no input e envia o formulário:
 * // - Mostra "Buscando clima..."
 * // - Atualiza card com temperatura, descrição e ícone
 * // - Alterna tema dia/noite
 * // - Exibe mensagem de erro caso a cidade não seja encontrada
 */

// Envio do formulário
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = input.value.trim();

    try {
        validarCidade(city);

        let location, weatherData;
        const cachedData = getCache(city);

        // Verifica compatibilidade de cache para não dar erro com caches do passado
        if (cachedData && cachedData.weather && cachedData.weather.current !== undefined) {
            location = cachedData.location;
            weatherData = cachedData.weather;
        } else {
            result.textContent = 'Buscando clima...';
            localStorage.removeItem(city.toLowerCase()); // Limpa cache sujo
            location = await getCoordinates(city);
            weatherData = await getWeather(location.latitude, location.longitude);
            // Salva o resultado no cache novo
            setCache(city, { location, weather: weatherData });
        }

        const current = weatherData.current;
        const daily = weatherData.daily;

        const description = getWeatherDescription(current.weather_code);
        const icon = getWeatherIcon(current.weather_code);

        const date = new Date(current.time);
        const formattedDate = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        const timeString = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

        const todayMax = daily.temperature_2m_max && daily.temperature_2m_max[0] !== undefined ? daily.temperature_2m_max[0].toFixed(0) : '--';
        const todayMin = daily.temperature_2m_min && daily.temperature_2m_min[0] !== undefined ? daily.temperature_2m_min[0].toFixed(0) : '--';

        toggleTheme(current.is_day);

        let forecastHTML = '<div class="forecast-list"><h3 class="forecast-title">Próximos Dias</h3>';
        
        for (let i = 1; i <= 5; i++) {
            if (!daily.time[i]) break; 
            const fDate = new Date(daily.time[i]);
            const userTimezoneOffset = fDate.getTimezoneOffset() * 60000;
            const adjustedDate = new Date(fDate.getTime() + userTimezoneOffset);
            
            const weekdayName = adjustedDate.toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "-feira");
            const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);
            const dayMonth = adjustedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
            
            const fMax = daily.temperature_2m_max[i].toFixed(0);
            const fMin = daily.temperature_2m_min[i].toFixed(0);
            const fDesc = getWeatherDescription(daily.weathercode[i]);
            const fIcon = getWeatherIcon(daily.weathercode[i]);
            
            const fWind = daily.wind_speed_10m_max[i] !== undefined ? daily.wind_speed_10m_max[i].toFixed(0) : '--';
            const fPrecip = daily.precipitation_sum[i] !== undefined ? daily.precipitation_sum[i].toFixed(1) : '--';

            forecastHTML += `
                <div class="forecast-card" onclick="this.classList.toggle('expanded')" style="cursor: pointer;">
                    <div class="f-main">
                        <div class="f-date">
                            <strong>${capitalizedWeekday}</strong>
                            <span>${dayMonth}</span>
                        </div>
                        <div class="f-icon">
                            <i class="wi ${fIcon}"></i>
                            <span class="f-desc">${fDesc}</span>
                        </div>
                        <div class="f-temp">
                            <div class="t-max"><span class="arrow-up">▲</span> ${fMax}°</div>
                            <div class="t-min"><span class="arrow-down">▼</span> ${fMin}°</div>
                        </div>
                    </div>
                    <div class="f-details">
                        <div class="f-det-item">
                            <i class="wi wi-strong-wind"></i>
                            <span>${fWind} km/h</span>
                        </div>
                        <div class="f-det-item">
                            <i class="wi wi-raindrops"></i>
                            <span>${fPrecip} mm</span>
                        </div>
                        <div class="f-det-item hint">
                            <small>Umidade diária não disp.</small>
                        </div>
                    </div>
                </div>
            `;
        }
        forecastHTML += '</div>';

        result.innerHTML = `
        <div class="weather-main-wrapper">
            <div class="hero-banner">
                <i class="wi ${icon} hero-icon"></i>
                <div class="hero-temp">
                    <span class="curr-temp">${current.temperature_2m.toFixed(0)}°</span>
                </div>
            </div>
            
            <h2 class="city-name">${location.name}, ${location.country}</h2>
            <p class="description">${description}</p>
            <p class="date">${formattedDate}<br>${timeString} (horário local)</p>

            <div class="today-max-min">
                <div class="max-box">
                    <span class="label">MÁXIMA</span>
                    <span class="val">${todayMax}°</span>
                </div>
                <div class="min-box">
                    <span class="label">MÍNIMA</span>
                    <span class="val">${todayMin}°</span>
                </div>
            </div>

            <div class="extra-variables">
                <div class="var-box">
                    <i class="wi wi-humidity"></i>
                    <span class="v-label">UMIDADE</span>
                    <strong class="v-val">${current.relative_humidity_2m}%</strong>
                </div>
                <div class="var-box">
                    <i class="wi wi-strong-wind"></i>
                    <span class="v-label">VENTO</span>
                    <strong class="v-val">${current.wind_speed_10m.toFixed(0)} km/h</strong>
                </div>
                <div class="var-box">
                    <i class="wi wi-raindrops"></i>
                    <span class="v-label">CHUVAS</span>
                    <strong class="v-val">${current.precipitation.toFixed(0)} mm</strong>
                </div>
            </div>

            ${forecastHTML}
        </div>
        `;

        document.body.classList.add('result-shown'); 
    } catch (error) {
        console.error(error);
        if (error.message.includes("Cidade")) showError("Cidade não encontrada.");
        else if (error.message.includes("conexão")) showError("Erro de conexão.");
        else showError(error.message);
    }
});