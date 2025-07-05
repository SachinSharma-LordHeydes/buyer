"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
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

export default function ProfileRedirectHandler() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    skip: !user || !isLoaded,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  useEffect(() => {
    console.log('ProfileRedirectHandler state:', {
      isLoaded,
      hasUser: !!user,
      loading,
      hasData: !!data,
      hasProfile: !!data?.me?.profile,
      pathname,
      error: error?.message
    });

    // Only handle redirects if user is authenticated and components are loaded
    if (isLoaded && user && !loading) {
      // Skip redirects for auth routes
      if (pathname.startsWith('/sign-in') || 
          pathname.startsWith('/sign-up')) {
        console.log('Skipping redirect for auth routes');
        return;
      }
      
      // Skip redirects for profile_setup - let ProfileSetupGuard handle it
      if (pathname.startsWith('/profile_setup')) {
        console.log('Skipping redirect for profile_setup - ProfileSetupGuard will handle');
        return;
      }

      // If there's an authentication error, user might not be in database yet
      if (error && error.message.includes('Authentication required')) {
        console.log('User not authenticated in GraphQL, redirecting to profile setup');
        router.replace('/profile_setup');
        return;
      }

      // If we have user data from GraphQL
      if (data?.me) {
        if (!data.me.profile) {
          // User exists but no profile - redirect to profile setup
          console.log('User exists but no profile, redirecting to profile setup');
          router.replace('/profile_setup');
        } else {
          console.log('User has profile, staying on current route');
        }
      } else if (!error) {
        // User doesn't exist in database yet - redirect to profile setup
        console.log('User not found in database, redirecting to profile setup');
        router.replace('/profile_setup');
      }
    }
  }, [isLoaded, user, data, loading, error, pathname, router]);

  return null;
}
