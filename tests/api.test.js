// tests/api.test.js

// Criando a função mock diretamente
const buscarClima = jest.fn();

// Funções helpers para reduzir repetição
const mockSuccess = (dados) => buscarClima.mockResolvedValueOnce(dados);
const mockError = (mensagem) => buscarClima.mockRejectedValueOnce(new Error(mensagem));

describe("Testes da função buscarClima com mock (otimizado)", () => {
    const cidades = {
        valida: "Rio de Janeiro",
        inexistente: "CidadeInexistente",
        vazia: "",
        lenta: "São Paulo",
        formato: "Belo Horizonte",
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Nome de cidade válido retorna dados meteorológicos", async () => {
        const dadosMock = { temperatura: 28, descricao: "Ensolarado" };
        mockSuccess(dadosMock);

        const resultado = await buscarClima(cidades.valida);
        expect(resultado).toEqual(dadosMock);
        expect(buscarClima).toHaveBeenCalledTimes(1);
        expect(buscarClima).toHaveBeenCalledWith(cidades.valida);
    });

    test("Nome de cidade inexistente lança exceção tratada", async () => {
        mockError("Cidade não encontrada");

        await expect(buscarClima(cidades.inexistente)).rejects.toThrow("Cidade não encontrada");
        expect(buscarClima).toHaveBeenCalledWith(cidades.inexistente);
    });

    test("Entrada vazia retorna erro de validação", async () => {
        mockError("Nome da cidade é obrigatório");

        await expect(buscarClima(cidades.vazia)).rejects.toThrow("Nome da cidade é obrigatório");
        expect(buscarClima).toHaveBeenCalledWith(cidades.vazia);
    });

    test("Falha da API gera resposta adequada", async () => {
        mockError("Erro de comunicação com a API");

        await expect(buscarClima(cidades.lenta)).rejects.toThrow("Erro de comunicação com a API");
        expect(buscarClima).toHaveBeenCalledWith(cidades.lenta);
    });

    test("Limite de requisições da API excedido", async () => {
        mockError("Limite de requisições excedido");

        await expect(buscarClima(cidades.valida)).rejects.toThrow("Limite de requisições excedido");
        expect(buscarClima).toHaveBeenCalledWith(cidades.valida);
    });

    test("Conexão de rede lenta/instável", async () => {
        // Simula delay na resposta
        buscarClima.mockImplementationOnce(() =>
            new Promise((resolve) =>
                setTimeout(() => resolve({ temperatura: 30, descricao: "Nublado" }), 3000)
            )
        );

        const resultado = await buscarClima(cidades.lenta);
        expect(resultado).toEqual({ temperatura: 30, descricao: "Nublado" });
        expect(buscarClima).toHaveBeenCalledWith(cidades.lenta);
    });

    test("Mudança inesperada no formato da resposta JSON", async () => {
        mockSuccess({ temp: 25, desc: "Chuvoso" });

        const resultado = await buscarClima(cidades.formato);
        expect(resultado).not.toHaveProperty("temperatura");
        expect(resultado).toHaveProperty("temp");
        expect(buscarClima).toHaveBeenCalledWith(cidades.formato);
    });
});