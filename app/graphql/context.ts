import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Role } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

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
    let userId: string | null = null;
    
    // First try the standard Clerk getAuth
    try {
      const auth = getAuth(request);
      userId = auth.userId;
      console.log('Standard auth userId:', userId);
    } catch (authError) {
      console.log('Standard auth failed, trying token from header:', authError);
      
      // Try to get token from Authorization header and verify it
      const authorization = request.headers.get('authorization');
      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.slice(7);
        try {
          // Use Clerk client to verify the session token
          const session = await clerkClient.verifyToken(token);
          userId = session.sub;
          console.log('Token verification userId:', userId);
        } catch (tokenError) {
          console.log('Token verification failed:', tokenError);
        }
      }
    }
    
    if (!userId) {
      console.log('No userId found in auth context');
      return { 
        request,
        prisma,
        user: null 
      };
    }

    console.log('Found userId:', userId);
    
    // Look up user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      console.log('User not found in database for clerkId:', userId);
      
      // The user might be newly created and webhook is still processing
      // Let's try to fetch user from Clerk and create if needed
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (email) {
          console.log('Creating user from Clerk data:', { userId, email });
          const newUser = await prisma.user.create({
            data: {
              clerkId: userId,
              email,
              role: 'SELLER',
            },
          });
          
          console.log('Created user from Clerk data:', newUser.email);
          return {
            request,
            prisma,
            user: {
              id: newUser.id,
              email: newUser.email,
              role: newUser.role,
            },
          };
        }
      } catch (clerkError) {
        console.log('Failed to fetch user from Clerk:', clerkError);
        // If we can't create the user, still return null but with better logging
        console.log('Continuing without user context due to Clerk fetch failure');
      }
      
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
