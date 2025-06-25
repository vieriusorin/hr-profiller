"use client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
	children: React.ReactNode;
	session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5,
						gcTime: 1000 * 60 * 10,
						retry: (failureCount: number, error: Error) => {
							if (error instanceof Error && "status" in error) {
								const status = (error as { status: number }).status;
								if (status >= 400 && status < 500) return false;
							}
							return failureCount < 3;
						},
						refetchOnWindowFocus: false,
					},
					mutations: {
						retry: 1,
					},
				},
			})
	);

	// Type assertion to work around NextAuth v4 + React 19 compatibility issue
	const SessionProviderComponent = SessionProvider as any;

	return (
		<SessionProviderComponent session={session}>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>
					{children}
					{process.env.NODE_ENV === "development" && (
						<ReactQueryDevtools initialIsOpen={false} />
					)}
				</NuqsAdapter>
			</QueryClientProvider>
		</SessionProviderComponent>
	);
}
