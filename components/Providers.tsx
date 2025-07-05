"use client";

import { ClerkProvider } from "@clerk/nextjs";
import ApolloProviderWrapper from "./apollo-provider-wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
    </ClerkProvider>
  );
}
