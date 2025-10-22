import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers/theme-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Opportunity Dashboard",
	description: "Manage client opportunities and resource allocation",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "black" },
	],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions);

	return (
		<html lang='en' className={cn(outfit.className)} suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<Providers session={session}>{children}</Providers>
				</ThemeProvider>
			</body>
		</html>
	);
}
