"use client";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

// Use NEXT_PUBLIC_GRAPHQL_ENDPOINT if set, otherwise default to /api/graphql
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/api/graphql";

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const httpLink = createHttpLink({
      uri: GRAPHQL_ENDPOINT,
    });

    const authLink = setContext(async (_, { headers }) => {
      try {
        // Get the authentication token from Clerk
        const token = await getToken();
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.log("Apollo auth token acquired:", !!token);
        }
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
          },
        };
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error getting auth token:", error);
        }
        return {
          headers: {
            ...headers,
          },
        };
      }
    });

    return new ApolloClient({
      link: from([authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          errorPolicy: "all",
        },
        query: {
          errorPolicy: "all",
        },
      },
    });
  }, [getToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
