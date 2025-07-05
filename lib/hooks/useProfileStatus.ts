"use client";

import { useUser } from "@clerk/nextjs";
import { gql, useQuery } from "@apollo/client";

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      email
      profile {
        id
        firstName
        lastName
      }
    }
  }
`;

export function useProfileStatus() {
  const { user, isLoaded } = useUser();
  const { data, loading, error } = useQuery(GET_USER_PROFILE, {
    skip: !user || !isLoaded,
  });

  const hasProfile = !!data?.me?.profile;
  const isAuthenticated = !!user && isLoaded;

  return {
    hasProfile,
    isAuthenticated,
    loading: !isLoaded || loading,
    error,
    user: data?.me,
  };
}
