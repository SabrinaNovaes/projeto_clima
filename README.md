🌤️ Projeto Clima


📖 Sobre o projeto

O Projeto Clima é uma aplicação web que permite consultar o clima atual de qualquer cidade de forma simples e rápida.

A aplicação consome APIs externas para obter:

📍 Coordenadas da cidade
🌡️ Temperatura atual
🌦️ Condições meteorológicas
🕒 Data e horário local

Além disso, o sistema conta com:

🌙 Tema dinâmico (dia/noite)
⚠️ Tratamento de erros
🧪 Testes automatizados com Jest
🎬 Demonstração

🚀 Funcionalidades

✔️ Buscar clima por nome da cidade
✔️ Validação de entrada do usuário
✔️ Exibição de card com:

Cidade e país
Temperatura
Descrição do clima
Ícone meteorológico
Data e hora local

✔️ Tema automático:

🌞 Claro (dia)
🌙 Escuro (noite)

✔️ Tratamento de erros:

Cidade não encontrada
Erro de conexão
Dados inválidos

✔️ Cache simples para evitar requisições repetidas

✔️ Testes automatizados com Jest

🛠️ Tecnologias
JavaScript (ES6+)
HTML5
CSS3
Jest (testes)
JSDoc (documentação)
APIs:
Open-Meteo
Geocoding API
📁 Estrutura do projeto
📦 projeto-clima
 ┣ 📄 index.html
 ┣ 📄 style.css
 ┣ 📄 api.js
 ┣ 📄 package.json
 ┣ 📄 jsdoc.json
 ┣ 📁 tests
 ┃ ┗ 📄 api.test.js
 ┗ 📁 docs
⚙️ Como rodar o projeto
🔹 1. Clone o repositório
git clone https://github.com/SabrinaNovaes/projeto_clima.git
🔹 2. Acesse a pasta
cd projeto_clima
🔹 3. Instale as dependências
npm install
🔹 4. Abra no navegador
index.html
🧪 Rodando os testes

Os testes foram implementados utilizando Jest, com foco em cenários reais e casos extremos.

▶️ Executar testes
npm test
📌 Cenários testados
✅ Cidade válida retorna dados
❌ Cidade inexistente retorna erro
⚠️ Entrada vazia (validação)
🌐 Falha de API
🚫 Limite de requisições excedido
🐢 Conexão lenta
🔄 Mudança inesperada no JSON
📄 Documentação (JSDoc)
Gerar documentação:
npm run docs
Abrir documentação:
start docs/index.html
💡 Exemplo de uso
const cidade = "Rio de Janeiro";

try {
    validarCidade(cidade);
    const location = await getCoordinates(cidade);
    const weather = await getWeather(location.latitude, location.longitude);

    const descricao = getWeatherDescription(weather.weathercode);
    
    console.log(`${descricao} - ${weather.temperature}°C`);
} catch (error) {
    console.error(error.message);
}
🔮 Melhorias futuras
🔎 Autocomplete de cidades
📅 Previsão de 7 dias
📱 Responsividade mobile
⚡ Cache com expiração
🎨 Animações avançadas
👩‍💻 Autora

Sabrina Oliveira
💻 Desenvolvedora Fullstack em formação

GitHub: https://github.com/SabrinaNovaes
⭐ Contribuição

Sinta-se à vontade para:

Abrir issues
Sugerir melhorias
Enviar pull requests
📜 Licença

Este projeto está sob a licença MIT.
