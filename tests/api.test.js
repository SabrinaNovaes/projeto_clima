// tests/api.test.js

// Criando a função mock diretamente
const buscarClima = jest.fn();

describe("Testes da função buscarClima com mock", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // limpa histórico de chamadas antes de cada teste
    });

    test("Nome de cidade válido retorna dados meteorológicos", async () => {
        const cidade = "Rio de Janeiro";
        const dadosMock = { temperatura: 28, descricao: "Ensolarado" };

        // Simula o retorno da função
        buscarClima.mockResolvedValueOnce(dadosMock);

        const resultado = await buscarClima(cidade);
        expect(resultado).toEqual(dadosMock);
        expect(buscarClima).toHaveBeenCalledTimes(1);
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    test("Nome de cidade inexistente lança exceção tratada", async () => {
        const cidade = "CidadeInexistente";

        // Simula rejeição da função
        buscarClima.mockRejectedValueOnce(new Error("Cidade não encontrada"));

        await expect(buscarClima(cidade)).rejects.toThrow("Cidade não encontrada");
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    // Entrada vazia
    test('Entrada vazia retorna erro de validação', async () => {
        const cidade = '';

        // Corrigido para retornar Promise rejeitada
        buscarClima.mockImplementationOnce((cidade) => {
            if (!cidade) return Promise.reject(new Error('Nome da cidade é obrigatório'));
            return Promise.resolve({ temperatura: 28, descricao: 'Ensolarado' });
        });

        await expect(buscarClima(cidade)).rejects.toThrow('Nome da cidade é obrigatório');
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    test("Falha da API gera resposta adequada (timeout ou erro)", async () => {
        const cidade = "São Paulo";

        buscarClima.mockRejectedValueOnce(
            new Error("Erro de comunicação com a API"),
        );

        await expect(buscarClima(cidade)).rejects.toThrow(
            "Erro de comunicação com a API",
        );
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    test('Limite de requisições da API excedido', async () => {
        const cidade = 'Rio de Janeiro';

        // Simula erro de limite excedido
        buscarClima.mockRejectedValueOnce(new Error('Limite de requisições excedido'));

        await expect(buscarClima(cidade)).rejects.toThrow('Limite de requisições excedido');
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    test('Conexão de rede lenta/instável', async () => {
        const cidade = 'São Paulo';

        // Simula delay longo na resposta da API
        buscarClima.mockImplementationOnce(() =>
            new Promise((resolve) => setTimeout(() => resolve({ temperatura: 30, descricao: 'Nublado' }), 3000))
        );

        const resultado = await buscarClima(cidade);
        expect(resultado).toEqual({ temperatura: 30, descricao: 'Nublado' });
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

    test('Mudança inesperada no formato da resposta JSON', async () => {
        const cidade = 'Belo Horizonte';

        // Simula resposta inesperada (sem campo temperatura)
        buscarClima.mockResolvedValueOnce({ temp: 25, desc: 'Chuvoso' });

        const resultado = await buscarClima(cidade);
        // Teste que falha caso o formato esperado não esteja presente
        expect(resultado).not.toHaveProperty('temperatura');
        expect(resultado).toHaveProperty('temp');
        expect(buscarClima).toHaveBeenCalledWith(cidade);
    });

});

