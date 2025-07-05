const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('Fetching all users...');
    const users = await prisma.user.findMany();
    
    console.log('Total users found:', users.length);
    users.forEach((user, index) => {
      console.log(`${index + 1}. User:`, {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    });
    
    if (users.length === 0) {
      console.log('No users found in database');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
