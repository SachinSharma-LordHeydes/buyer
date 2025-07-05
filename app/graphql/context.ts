import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Role } from '@prisma/client';
import type { NextRequest } from 'next/server';

const prisma = new PrismaClient();

export interface GraphQLContext {
  request: NextRequest;
  prisma: PrismaClient;
  user: {
    id: string;
    email: string;
    role: Role;
  } | null;
}

export async function createContext({ request }: { request: NextRequest }): Promise<GraphQLContext> {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      console.log('No userId found in auth context');
      return { 
        request,
        prisma,
        user: null 
      };
    }

    console.log('Found userId:', userId);
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      console.log('User not found in database for clerkId:', userId);
      return { 
        request,
        prisma,
        user: null 
      };
    }

    console.log('Found database user:', dbUser.email);
    
    return {
      request,
      prisma,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
    };
  } catch (error) {
    console.error('Error in createContext:', error);
    return {
      request,
      prisma,
      user: null
    };
  }
}
