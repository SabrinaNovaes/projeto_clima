# 🌤️ Projeto Clima


## 📖 Descrição

O Projeto Clima é uma aplicação web que permite consultar o clima atual de qualquer cidade usando APIs externas (Open-Meteo e Geocoding).

O sistema:

- Valida o nome da cidade informado pelo usuário.
- Obtém coordenadas geográficas da cidade.
- Consulta o clima atual, incluindo temperatura, condição meteorológica e código de clima.
- Alterna o tema da página entre claro e escuro dependendo do horário (dia/noite).
- Exibe mensagens de erro amigáveis caso ocorra algum problema.
- Possui fallbacks para cenários em que a API retorna campos inesperados.

<hr>

## 📁 Estrutura do projeto

```
📦 projeto-clima
|  ┣ 📄 index.html
|  ┣ 📄 style.css
|  ┣ 📄 api.js
|  ┣ 📄 package.json
|  ┣ 📄 jsdoc.json
|  ┣ 📁 tests
|  ┃ ┗ 📄 api.test.js
|  ┗ 📁 docs
```
<hr>

## 🛠 Tecnologias Utilizadas

<div>
<img width="48" height="48" src="https://img.icons8.com/color/48/javascript--v1.png" alt="javascript--v1"/>
<img width="48" height="48" src="https://img.icons8.com/color/48/html-5--v1.png" alt="html-5--v1"/>
<img width="48" height="48" src="https://img.icons8.com/color/48/css3.png" alt="css3"/>
<img width="48" height="48" src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/24/external-jest-can-collect-code-coverage-information-from-entire-projects-logo-color-tal-revivo.png" alt="external-jest-can-collect-code-coverage-information-from-entire-projects-logo-color-tal-revivo"/>
<img width="48" height="48" src="https://img.icons8.com/color/48/doc.png" alt="doc"/>
</div>

<hr>

## APIs:
Open-Meteo |
Geocoding API

<hr>

## 🚀 Funcionalidades

✔️ Buscar clima por nome da cidade <br>
✔️ Validação de entrada do usuário <br>
✔️ Exibição de card com:
```
Cidade e país
Temperatura Atual, Máximas e Mínimas
Umidade (%), Velocidade do Vento e Precipitação
Descrição do clima
Ícone meteorológico animado com suporte ao tema
Data e hora local
```

✔️ Card Interativo de Previsão Múltipla:
```
Previsão para os próximos 5 dias
Acelerador visual de "Acordeão": Mostra chuvas e ventos detalhados ao expandir os dias
```

✔️ Tema automático:
```
🌞 Claro (dia)
🌙 Escuro (noite)
```

✔️ Tratamento de erros:
```
Cidade não encontrada
Erro de conexão
Dados inválidos
```

✔️ Cache simples para evitar requisições repetidas <br>
✔️ Testes automatizados com Jest

<hr>

## ⚙️ Como rodar o projeto

🔹 1. Clone o repositório
git clone 
```bash
https://github.com/SabrinaNovaes/projeto_clima.git
```
🔹 2. Acesse a pasta
```bash
cd projeto_clima
```
🔹 3. Instale as dependências
```bash
npm install
```
🔹 4. Abra no navegador
```bash
index.html
```

<hr>

## 🧪 Rodando os testes

Os testes foram implementados utilizando Jest, com foco em cenários reais e casos extremos.

▶️ Executar testes
```bash
npm teste
```

## 📌 Cenários testados

✅ Cidade válida retorna dados <br>
❌ Cidade inexistente retorna erro <br>
⚠️ Entrada vazia (validação) <br>
🌐 Falha de API <br>
🚫 Limite de requisições excedido <br>
🐢 Conexão lenta <br>
🔄 Mudança inesperada no JSON <br>

<hr> 

## 📄 Documentação (JSDoc)

🔹 Gerar documentação:
```bash
npm run docs
```
🔹 Abrir documentação:
```bash
start docs/index.html
```
<hr> 

## 💡 Exemplo de uso


<hr>

## 🔮 Melhorias futuras
🔎 Autocomplete de cidades <br>
📱 Responsividade mobile <br>
⚡ Evolução do LocalStorage para IndexedDB <br> 

<hr>

## 👩‍💻 Autora

Sabrina Novaes <br>
💻 Desenvolvedora Fullstack <br>
Linkkedin: https://www.linkedin.com/in/sabrina-novaes/ <br>
GitHub: https://github.com/SabrinaNovaes

<hr> 

## ⭐ Contribuição

Sinta-se à vontade para:

Abrir issues <br>
Sugerir melhorias <br>
Enviar pull requests <br> 

## 📜 Licença

Este projeto está sob a licença MIT.
