const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Seed 20 products
  for (let i = 1; i <= 20; i++) {
    await prisma.product.create({
      data: {
        name: `Product ${i}`,
        description: `Description for product ${i}`,
        price: Math.floor(Math.random() * 100) + 1, // Random price between 1 and 100
        stock: Math.floor(Math.random() * 10) + 1, // Random stock between 1 and 10
      },
    });
  }

  // Seed a default user
  const user = await prisma.user.create({
    data: {
      username: 'testUser',
      password: 'hashedPasswordHere', // You should hash a password here using bcrypt
    },
  });

  console.log('Seeding completed.');
}

seed()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });