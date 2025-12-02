# 🐶 Sistema de Gerenciamento Petshop (Full-Stack)

## Visão Geral do Projeto

Este projeto é uma aplicação completa (Full-Stack) desenvolvida para gerenciar agendamentos de serviços (banho e tosa) em um petshop. O sistema utiliza uma arquitetura moderna em **TypeScript**, o padrão de **Monorepo** e uma estrutura de **Camadas (Controllers e Services)** para máxima organização e manutenibilidade.

A aplicação está totalmente configurada e preparada para deploy em produção (Render/PostgreSQL).

## 📊 Arquitetura e Tecnologias

| Camada             | Tecnologia Principal | Propósito                                                                      |
| :----------------- | :------------------- | :----------------------------------------------------------------------------- |
| **Arquitetura**    | Monorepo / Camadas   | Separação clara da lógica de Negócios (Services) da camada HTTP (Controllers). |
| **Backend**        | Node.js (Express)    | API RESTful e lógica de segurança.                                             |
| **Linguagem**      | TypeScript           | Tipagem estática e segurança de código em todo o projeto.                      |
| **Banco de Dados** | PostgreSQL           | Armazenamento persistente de dados.                                            |
| **ORM**            | Prisma               | Mapeamento Objeto-Relacional, migrações e transações seguras.                  |
| **Validação**      | Zod                  | Validação de schemas rigorosa, incluindo validação de CPF e datas.             |
| **Frontend**       | React (Vite)         | Interface do usuário otimizada, com lógica isolada em Custom Hooks.            |
| **Segurança**      | JWT + Bcrypt         | Autenticação e criptografia de senhas.                                         |

## ✨ Principais Funcionalidades (Polidas)

- **Validação de Datas:** O sistema impede agendamentos que ultrapassem o ano atual, tanto via UX do frontend quanto via validação Zod no backend.
- **Limpeza Automática (Cleanup):** Rotina de inicialização do servidor que remove agendamentos finalizados (CONCLUIDO/CANCELADO) e expirados, mantendo o banco de dados limpo e otimizado.
- **Consistência de Serviços:** O script de seed garante que todos os serviços ("Banho", "Tosa", etc.) estejam disponíveis de forma consistente em qualquer ambiente (local/deploy).
- **UX Aprimorada:** Botão de atalho para o Menu Principal no Histórico de Agendamentos.
- **Controle Administrativo:** Gestão de Preços por Porte, Bloqueio de Agenda (Feriados/Almoços) e Dashboard de Estatísticas.
- **CRUD Completo:** Suporte a todas as operações de criação, leitura, edição e exclusão de Usuários, Cães e Agendamentos.

## 🛠️ Configuração Local do Projeto

### 1. Instalação e Setup

Execute a instalação de dependências na raiz, que cobre tanto o Backend quanto o Frontend:

```bash
# Instala dependências da raiz
npm install

# Instala dependências do frontend (necessário para o Vite)
npm install --prefix frontend

# Terminal 1: Iniciar o Backend (API)
npm run dev

# Terminal 2: Iniciar o Frontend (Vite)
npm run dev --prefix frontend



### 💻 Perfil do administrador.
Perfil,Email / Login,Senha
Administrador,admin@gmail.com,admin123
```
