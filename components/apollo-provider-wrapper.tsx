"use client";
import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

export default function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: "/api/graphql",
    });

    const authLink = setContext(async (_, { headers }) => {
      try {
        // Get the authentication token from Clerk
        const token = await getToken();
        
        console.log('Apollo auth token acquired:', !!token);
        
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          }
        };
      } catch (error) {
        console.error('Error getting auth token:', error);
        return {
          headers: {
            ...headers,
          }
        };
      }
    });

    return new ApolloClient({
      link: from([authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: 'all',
        },
        query: {
          errorPolicy: 'all',
        },
      },
    });
  }, [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
