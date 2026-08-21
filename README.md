# API - Rede Raízes do Nordeste

Projeto Multidisciplinar (Trilha Back-End) - UNINTER

**Aluno:** Alex Nogueira Nanni
**RU:** 5055380
**Polo:** Campinas - SP (Centro)

## Sobre o Projeto
API RESTful desenvolvida em Node.js + TypeScript + Prisma ORM para gerenciar pedidos, estoque e pagamentos mock da franquia "Raízes do Nordeste".  
O projeto segue uma arquitetura em camadas (Domain, Application, Infrastructure, API) e atende aos requisitos de multicanalidade, LGPD e segurança (JWT + bcrypt).

## Tecnologias
- Node.js + Express
- TypeScript
- Prisma ORM (v7)
- PostgreSQL
- JWT (autenticação)
- Bcrypt (hash de senhas)
- Prisma Adapter PG

## Pré-requisitos
- Node.js v18+
- PostgreSQL (local)

## Instalação e Execução

1. Clone o repositório:

git clone https://github.com/Alex-Nanni/projeto-raizes-nordeste-api
cd projeto-raizes-backend-api

2. Instale as dependências:

npm install

3. Configure o arquivo `.env` baseado no `.env.example`.

4. Execute as migrations e o seed:

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

5. Inicie o servidor:

npm run dev

A API estará disponível em `http://localhost:3000/api`.

## Endpoints Principais
- `POST /api/auth/login` - Autenticação
- `POST /api/pedidos` - Criação de pedido (exige JWT)
- `GET /api/pedidos?canal=APP&page=1` - Listagem filtrada
- `POST /api/pagamentos/mock` - Simulação de pagamento (exige JWT)

## Testes
Importe a coleção `colecao_testes_raizes.json` no Postman ou Insomnia.

## Link do Repositório
https://github.com/Alex-Nanni/projeto-raizes-nordeste-api

## Documentação da API
A documentação interativa (Swagger) estará disponível em:
`http://localhost:3000/api-docs` após iniciar o servidor.