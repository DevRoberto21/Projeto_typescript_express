Com certeza! Entendido que a formatação das tabelas em Markdown estava sendo perdida. Para garantir que as seções de Tecnologias e Endpoints sejam exibidas corretamente em qualquer editor ou visualizador (como um bloco de código), vou reenviar o README.md completo, colocando o código-fonte das tabelas dentro de blocos Markdown (markdown ... ).

Aqui está a versão final para você copiar e colar:

🐾 Petshop API: Sistema de Agendamento (Backend)
📌 Visão Geral
O Petshop API é o backend de um sistema para gerenciamento de clientes e agendamento de serviços (banho e tosa) para cães.

O projeto foi construído com foco na segurança, performance e tipagem rigorosa, utilizando o Prisma para gerenciar o estado do banco de dados (PostgreSQL) e o Zod para validações complexas. A autenticação é feita via JWT.

💻 Tecnologias e Funcionalidades
Para garantir a formatação, o código da tabela de tecnologias está no bloco abaixo:

Markdown

| Categoria           | Tecnologia       | Uso                                                                   |
| :------------------ | :--------------- | :-------------------------------------------------------------------- |
| **Linguagem**       | **TypeScript**   | Garante tipagem estática e segurança em todo o código.                |
| **Framework**       | **ExpressJS**    | Criação rápida e robusta dos endpoints da API.                        |
| **Banco de Dados**  | **PostgreSQL**   | Armazenamento relacional e confiável.                                 |
| **ORM**             | **Prisma**       | Mapeamento Objeto-Relacional e gerenciamento de migrações.            |
| **Validação**       | **Zod**          | Validação de schemas rigorosa (incluindo regex para CPF/Telefone BR). |
| **Segurança**       | **JWT + Bcrypt** | Tokens de acesso e criptografia de senhas.                            |
| **Relacionamentos** | **Many-to-Many** | Agendamentos vinculados a múltiplos cães e múltiplos serviços.        |
| **API Externa**     | **dog.ceo**      | Validação assíncrona da existência de raças de cães.                  |

🏁 Endpoints e Níveis de Acesso
A estrutura de endpoints segue o padrão RESTful, com as definições da tabela mantidas em um bloco de código para evitar problemas de mesclagem:

Markdown

| Recurso             | Endpoint         | Operações                                              | Nível de Acesso                                        |
| :------------------ | :--------------- | :----------------------------------------------------- | :----------------------------------------------------- |
| **Autenticação**    | `/auth/register` | `POST`                                                 | **Público**                                            |
|                     | `/auth/login`    | `POST`                                                 | **Público**                                            |
| **Clientes (User)** | `/users`         | `GET` (All), `GET` (ID), `PUT` (Self), `DELETE` (Self) | Autenticado (JWT)                                      |
| **Cães (Dog)**      | `/dogs`          | `GET`, `POST`, `PUT`, `DELETE`                         | Autenticado (JWT)                                      |
| **Serviços**        | `/services`      | `GET` (All), `GET` (ID), `POST`, `PUT`, `DELETE`       | `GET`s são **Públicos**; Outros são Autenticados (JWT) |
| **Agendamentos**    | `/appointments`  | `GET`, `POST`, `PUT`, `DELETE`                         | Autenticado (JWT)                                      |

Documentação Interativa
Toda a documentação detalhada da API está disponível na interface Swagger:

👉 http://localhost:3000/docs (Acessível após iniciar o servidor)

⚙️ Instalação e Execução Local
Siga estes passos para clonar e configurar o projeto na sua máquina.

Pré-requisitos
Certifique-se de ter instalado e rodando:

Node.js (versão LTS)

npm (gerenciador de pacotes)

PostgreSQL (servidor de banco de dados rodando localmente).

1. Clonar e Instalar Dependências
   Bash

# 1. Clone o repositório

git clone https://github.com/DevRoberto21/Projeto_typescript_express
cd Projeto_typescript_express

# 2. Instale todas as dependências

npm install 2. Configuração do Ambiente (.env)
Crie o arquivo .env e insira suas credenciais.

Bash

# Copia o modelo para criar o arquivo .env

cp .env.example .env
Atenção: Edite o arquivo .env preenchendo o JWT_SECRET com uma chave aleatória e o DATABASE_URL com a string de conexão do seu PostgreSQL local.

3. Setup e Migração do Banco de Dados
   Aplique o schema e prepare o cliente Prisma:

Bash

# 1. Gerar o cliente Prisma

npm run prisma:generate

# 2. Aplicar as migrações (cria as tabelas no PostgreSQL)

# Confirme com 'Y' quando solicitado.

npm run prisma:migrate 4. Iniciar o Servidor
O comando dev:all inicia a API e o visualizador do banco de dados simultaneamente.

Bash

# Inicia a API (porta 3000) e o Prisma Studio (porta 5555)

npm run dev:all
⚡️ Fluxo de Teste Rápido
Para testar a API, siga este fluxo:

1. POST /auth/register (Cria o usuário e copia o JWT).

2. Authorize no Swagger com o token (Ex: Bearer <token>).

3. POST /services (Cria um serviço e copia o ID).

4. POST /dogs (Cria um cão para o seu usuário e copia o ID).

5. POST /appointments (Usa o ID do Cão e o ID do Serviço para criar o agendamento Many-to-Many).
