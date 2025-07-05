const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // The userId we see in the logs
    const clerkId = 'user_2zSZndSV3IKjm2TySleEKqfS0vw';
    const email = 'currentuser@example.com'; // This user is missing from database
    
    console.log('Checking if user exists...');
    const existingUser = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return;
    }
    
    console.log('Creating user...');
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        role: 'SELLER'
      }
    });
    
    console.log('User created successfully:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
