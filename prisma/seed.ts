import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar usuário cliente para teste
  const senhaHash = await bcrypt.hash('Senha@123', 10);
  const cliente = await prisma.usuario.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      nome: 'Cliente Teste',
      email: 'cliente@exemplo.com',
      senhaHash,
      perfil: 'CLIENTE',
      lgpdConsentimento: true,
    },
  });

  // 2. Criar uma unidade
  const unidade = await prisma.unidade.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nome: 'Recife - Boa Viagem',
      endereco: 'Av. Boa Viagem, 1000',
      ativa: true,
    },
  });

  // 3. Criar produtos
  const produto1 = await prisma.produto.upsert({
    where: { id: 10 },
    update: {},
    create: {
      id: 10,
      nome: 'Tapioca de Carne Seca',
      descricao: 'Tapioca recheada com carne seca desfiada',
      preco: 39.90,
      ativo: true,
    },
  });

  const produto2 = await prisma.produto.upsert({
    where: { id: 20 },
    update: {},
    create: {
      id: 20,
      nome: 'Cuscuz com Ovo',
      descricao: 'Cuscuz nordestino com manteiga e ovo',
      preco: 29.90,
      ativo: true,
    },
  });

  // 4. Criar estoque para a unidade
  await prisma.estoque.upsert({
    where: { id: 1 },
    update: { quantidade: 10 },
    create: {
      id: 1,
      unidadeId: 1,
      produtoId: 10,
      quantidade: 10,
    },
  });

  await prisma.estoque.upsert({
    where: { id: 2 },
    update: { quantidade: 5 },
    create: {
      id: 2,
      unidadeId: 1,
      produtoId: 20,
      quantidade: 5,
    },
  });

  console.log('✅ Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });