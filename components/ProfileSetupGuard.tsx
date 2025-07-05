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
  const { data, loading } = useQuery(GET_USER_PROFILE, {
    skip: !user || !isLoaded,
  });

  useEffect(() => {
    if (isLoaded && user && !loading && data?.me?.profile) {
      // User has a profile, redirect to dashboard
      router.push('/');
    }
  }, [isLoaded, user, data, loading, router]);

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
