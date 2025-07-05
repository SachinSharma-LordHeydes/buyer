"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      email
      profile {
        id
      }
    }
  }
`;

export default function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    skip: !user || !isLoaded,
    fetchPolicy: 'cache-and-network', // Always check for updates
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (isLoaded && user && !loading) {
      if (data?.me?.profile) {
        // User has a profile, redirect to dashboard
        console.log('ProfileSetupGuard: User has profile, redirecting to dashboard');
        router.replace('/');
      } else if (!error || !error.message.includes('Authentication required')) {
        // User exists but no profile, stay on profile setup
        console.log('ProfileSetupGuard: User exists but no profile, staying on setup');
      }
    }
  }, [isLoaded, user, data, loading, error, router]);

  // Show loading while checking
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has profile, don't render children (will redirect)
  if (data?.me?.profile) {
    return null;
  }

  return <>{children}</>;
}
