import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger/swagger';

// Importação das rotas
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dogRoutes from './routes/dogRoutes';
import serviceRoutes from './routes/serviceRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import blockedTimeSlotRoutes from './routes/blockedTimeSlotRoutes';
import statsRoutes from './routes/statsRoutes';
import prisma from './prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
//Define a origem CORS baseada na variável de ambiente (necessário para o Render).
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'; 

// --- Middlewares ---
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
})); //Configurado para permitir o acesso do Frontend em produção.
app.use(express.json()); // Permite que a API receba JSON no body da requisição

// --- Rotas da API ---
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/dogs', dogRoutes);
app.use('/services', serviceRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin/blocked-slots', blockedTimeSlotRoutes);
app.use('/admin/stats', statsRoutes);

// --- Rota do Swagger ---
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Petshop API Docs',
  // Configuração para permitir entrada do JWT no Swagger UI
  swaggerOptions: {
    security: [{
      bearerAuth: []
    }],
    docExpansion: 'none',
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
  }
}));

// --- Handler de Erros Centralizado ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor. Algo deu errado!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- Inicia o Servidor ---
async function main() {
  try {
    // Conectar ao banco de dados 
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📖 Documentação Swagger em http://localhost:${PORT}/docs`);
      console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`); //Loga a origem CORS configurada.
    });
  } catch (e) {
    console.error('❌ Falha ao iniciar o servidor ou conectar ao banco de dados:', e);
    process.exit(1);
  }
}

main();

// Hook para desconexão do Prisma (limpeza)
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});