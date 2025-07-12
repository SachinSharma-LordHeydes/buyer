// app/hooks/useAuthStatus.ts
"use client";

import { useAuth } from "@clerk/nextjs";

export const useAuthStatus = () => {
  const { isSignedIn, userId } = useAuth();

  return {
    isLoggedIn: isSignedIn,
    userId,
  };
};
