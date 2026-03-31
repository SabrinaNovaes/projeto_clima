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
                    current_weather: { temperature: 28, weathercode: 0, is_day: 1, time: "2026-03-31T12:00" }
                })
            });

        expect(() => validarCidade("Rio de Janeiro")).not.toThrow();

        const location = await getCoordinates("Rio de Janeiro");
        expect(location.name).toBe("Rio de Janeiro");
        
        const weather = await getWeather(location.latitude, location.longitude);
        expect(weather.temperature).toBe(28);
        expect(weather.weathercode).toBe(0);

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
});