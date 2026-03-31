/**
 * @jest-environment jsdom
 * @fileoverview Testes unitários reais do módulo de clima.
 * O código original permanece intocado. Lemos o arquivo dinamicamente para contornar problemas sintáticos do Node.js.
 */
const fs = require("fs");
const path = require("path");

// 1. INICIALIZAÇÃO DO DOM (No escopo global)
document.body.innerHTML = `
    <form id="weather-form"></form>
    <input type="text" id="city-input" />
    <div id="result"></div>
    <button id="home-btn"></button>
`;

// 2. Extraindo o código e removendo dinamicamente a palavra 'export' para não quebrar o Node CommonJS
const apiPath = path.resolve(__dirname, "../api.js");
let apiCode = fs.readFileSync(apiPath, "utf-8");
apiCode = apiCode.replace(/export\s+\{([^>]*)\};/, "");

// 3. Avaliando o script de forma isolada dentro do ambiente JSDOM
eval(apiCode);
// As funções originais (validarCidade, getCoordinates, getWeather) agora existem no escopo global.

describe("Testes Básicos da Consulta de Clima", () => {

    beforeAll(() => {
        // Mock do localStorage adicionado pelo usuário
        global.localStorage = {
            store: {},
            getItem(key) { return this.store[key] || null; },
            setItem(key, value) { this.store[key] = value; },
            removeItem(key) { delete this.store[key]; }
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // 1. Nome de cidade válido retorna dados meteorológicos.
    test("Nome de cidade válido retorna dados meteorológicos", async () => {
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    results: [{ latitude: -22.9, longitude: -43.2, name: "Rio de Janeiro", country: "Brasil" }]
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    current: { 
                        time: "2026-03-31T12:00",
                        temperature_2m: 28, 
                        relative_humidity_2m: 75,
                        precipitation: 0.0,
                        wind_speed_10m: 12.5,
                        weather_code: 0, 
                        is_day: 1 
                    },
                    daily: { 
                        time: ["2026-03-31", "2026-04-01", "2026-04-02"],
                        temperature_2m_max: [30, 31, 29],
                        temperature_2m_min: [22, 23, 21],
                        precipitation_sum: [0.0, 5.0, 2.0],
                        wind_speed_10m_max: [15, 20, 10],
                        weathercode: [0, 1, 2]
                    }
                })
            });

        expect(() => validarCidade("Rio de Janeiro")).not.toThrow();

        const location = await getCoordinates("Rio de Janeiro");
        expect(location.name).toBe("Rio de Janeiro");
        
        const weatherData = await getWeather(location.latitude, location.longitude);
        expect(weatherData.current.temperature_2m).toBe(28);
        expect(weatherData.current.weather_code).toBe(0);
        expect(weatherData.current.relative_humidity_2m).toBe(75);
        expect(weatherData.daily.precipitation_sum[1]).toBe(5.0);
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // 2. Nome de cidade inexistente lança exceção tratada.
    test("Nome de cidade inexistente lança exceção tratada", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ results: undefined })
        });

        await expect(getCoordinates("CidadeInexistente")).rejects.toThrow("Cidade não encontrada.");
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // 3. Entrada vazia retorna erro de validação.
    test("Entrada vazia retorna erro de validação", () => {
        expect(() => validarCidade("")).toThrow("Digite o nome de uma cidade.");
        expect(() => validarCidade("   ")).toThrow("Digite o nome de uma cidade.");
    });

    // 4. Falha da API gera resposta adequada (timeout ou erro).
    test("Falha da API gera resposta adequada (erro de rede/timeout)", async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error("Timeout/Falha na API"));

        // Garante que o método assíncrono joga a exceção mapeada para falha de rede da API original
        await expect(getCoordinates("São Paulo")).rejects.toThrow("Erro de conexão ao buscar coordenadas.");
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // 5. Teste de lógica de Cache Integrado.
    test("Armazenar e ler valores do Cache sem acionar fetch redundante", () => {
        const testCity = "cachedcity";
        const testData = {
            location: { name: "MockName" },
            weather: {
                current: { temperature_2m: 20 },
                daily: { temperature_2m_max: [25] }
            }
        };

        // Salva mock diretamente passando pela flag global
        setCache(testCity, testData);

        // A tentativa de ler a cidade deve recuperar os dados corretamente ignorando uppercase
        const cacheHit = getCache("CachedCITY");
        
        expect(cacheHit).not.toBeNull();
        expect(cacheHit.location.name).toBe("MockName");
        expect(cacheHit.weather.current.temperature_2m).toBe(20);
        expect(cacheHit.weather.daily.temperature_2m_max[0]).toBe(25);
    });
});