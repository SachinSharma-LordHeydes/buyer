"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import ApolloProviderWrapper from "./apollo-provider-wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <ApolloProviderWrapper>{children}</ApolloProviderWrapper>
      </ThemeProvider>
    </ClerkProvider>
  );
} 