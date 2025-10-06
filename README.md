🐾 Petshop API: Sistema de Agendamento (Backend)
📌 Visão Geral

O Petshop API é o backend de um sistema para gerenciamento de clientes e agendamento de serviços (banho e tosa) para cães.

O projeto foi construído com foco em segurança, performance e tipagem rigorosa, utilizando o Prisma para gerenciar o estado do banco de dados (PostgreSQL) e o Zod para validações complexas.
A autenticação é feita via JWT com criptografia de senhas utilizando Bcrypt.

💻 Tecnologias e Funcionalidades

Para garantir a formatação, a tabela de tecnologias está dentro de um bloco Markdown:

| Categoria       | Tecnologia   | Uso                                                                   |
| --------------- | ------------ | --------------------------------------------------------------------- |
| Linguagem       | TypeScript   | Garante tipagem estática e segurança em todo o código.                |
| Framework       | ExpressJS    | Criação rápida e robusta dos endpoints da API.                        |
| Banco de Dados  | PostgreSQL   | Armazenamento relacional e confiável.                                 |
| ORM             | Prisma       | Mapeamento Objeto-Relacional e gerenciamento de migrações.            |
| Validação       | Zod          | Validação rigorosa de schemas (incluindo regex para CPF/Telefone BR). |
| Segurança       | JWT + Bcrypt | Tokens de acesso e criptografia de senhas.                            |
| Relacionamentos | Many-to-Many | Agendamentos vinculados a múltiplos cães e múltiplos serviços.        |
| API Externa     | dog.ceo      | Validação assíncrona da existência de raças de cães.                  |

🏁 Endpoints e Níveis de Acesso

A estrutura de endpoints segue o padrão RESTful, com as definições mantidas no bloco abaixo:

| Recurso         | Endpoint       | Operações                                      | Nível de Acesso               |
| --------------- | -------------- | ---------------------------------------------- | ----------------------------- |
| Autenticação    | /auth/register | POST                                           | Público                       |
|                 | /auth/login    | POST                                           | Público                       |
| Clientes (User) | /users         | GET (All), GET (ID), PUT (Self), DELETE (Self) | Autenticado (JWT)             |
| Cães (Dog)      | /dogs          | GET, POST, PUT, DELETE                         | Autenticado (JWT)             |
| Serviços        | /services      | GET (All), GET (ID), POST, PUT, DELETE         | GETs são Públicos; demais JWT |
| Agendamentos    | /appointments  | GET, POST, PUT, DELETE                         | Autenticado (JWT)             |

📖 Documentação Interativa

Toda a documentação detalhada da API está disponível via Swagger:

👉 http://localhost:3000/docs

(Acessível após iniciar o servidor)

⚙️ Instalação e Execução Local
Pré-requisitos

Certifique-se de ter instalado e rodando em sua máquina:

Node.js (versão LTS)

npm (gerenciador de pacotes)

PostgreSQL (servidor local configurado)

1️⃣ Clonar e Instalar Dependências

# Clone o repositório

git clone https://github.com/DevRoberto21/Projeto_typescript_express
cd Projeto_typescript_express

# Instale as dependências

npm install

2️⃣ Configuração do Ambiente (.env)

Crie o arquivo .env e insira suas credenciais.

# Copia o modelo para criar o arquivo .env

cp .env.example .env

⚠️ Atenção:
Edite o arquivo .env preenchendo:

JWT_SECRET → com uma chave aleatória e segura.

DATABASE_URL → com a string de conexão do seu PostgreSQL local.

3️⃣ Setup e Migração do Banco de Dados

Aplique o schema e prepare o cliente Prisma:

# Gerar o cliente Prisma

npm run prisma:generate

# Aplicar as migrações (cria as tabelas no PostgreSQL)

npm run prisma:migrate

Confirme com “Y” quando solicitado.

4️⃣ Iniciar o Servidor

O comando dev:all inicia a API e o visualizador do banco de dados (Prisma Studio) simultaneamente.

# Inicia a API (porta 3000) e o Prisma Studio (porta 5555)

npm run dev:all

⚡️ Fluxo de Teste Rápido

Siga este fluxo básico para testar o sistema rapidamente:

POST /auth/register → Cria um novo usuário e copia o JWT retornado.

Authorize no Swagger → Use o token no formato: Bearer <seu_token>.

POST /services → Cria um serviço e copie o ID.

POST /dogs → Cria um cão vinculado ao seu usuário e copie o ID.

POST /appointments → Use os IDs do Cão e do Serviço para criar um agendamento Many-to-Many.
