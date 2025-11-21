import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Petshop API (Express + TypeScript + Prisma)',
      version: '1.0.0',
      description: 'Backend para um sistema de agendamento de banho/tosa para cachorros. Inclui autenticação JWT, validação Zod e API dog.ceo.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token de acesso JWT (Ex: Bearer <seu_token>).',
            }
        },
        // Schemas globais referenciados nas rotas
        schemas: {
            UserCreate: { 
                type: 'object',
                properties: {
                    nome: { type: 'string', example: 'João da Silva' },
                    email: { type: 'string', format: 'email', example: 'joao.silva@exemplo.com' },
                    cpf: { type: 'string', description: 'Apenas 11 dígitos.', example: '12345678901' },
                    idade: { type: 'integer', example: 30 },
                    telefone: { type: 'string', nullable: true, example: '991234567' },
                    password: { type: 'string', format: 'password', example: 'minhaSenha123' },
                }
            },
            // Note: Não são necessários todos os schemas completos aqui se a rota os define inline ou usa o nome de tipo padrão do Zod
        }
    },
  },
  // Onde buscar os comentários de documentação: em todos os arquivos de rota (.ts)
  apis: ['./src/routes/*.ts', './src/schemas/zod/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;