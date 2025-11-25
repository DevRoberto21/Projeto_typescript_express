import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert: Cria se não existir, atualiza se existir
  await prisma.user.upsert({
    where: { email },
    update: {}, // Se já existe, não faz nada
    create: {
      email,
      nome: 'Administrador Principal',
      cpf: '00000000000',
      idade: 99,
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      telefone: '00000000000'
    },
  });

  console.log('🌱 Admin user seeded: admin@gmail.com');
  
  // Criar serviços padrão se não existirem
  const services = [
    { name: 'Banho Completo', pricePequeno: 40.0, priceMedio: 50.0, priceGrande: 60.0 },
    { name: 'Tosa Higiênica', pricePequeno: 30.0, priceMedio: 40.0, priceGrande: 50.0 },
    { name: 'Tosa Completa', pricePequeno: 60.0, priceMedio: 80.0, priceGrande: 100.0 },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }
  console.log('🌱 Default services seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });