import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "./providers/theme-provider";
import { getSettings } from "@/lib/settings";

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
	return (
		<html lang='en' className={cn(outfit.className)} suppressHydrationWarning>
			<body>
				<ThemeProvider>
					<Providers>{children}</Providers>
					<Toaster
						position='top-right'
						toastOptions={{
							duration: 4000,
							style: {
								background: (await getSettings()).primaryColor,
								color: (await getSettings()).primaryForeground,
							},
							success: {
								duration: 3000,
								iconTheme: {
									primary: "#4ade80",
									secondary: "#fff",
								},
							},
							error: {
								duration: 5000,
								iconTheme: {
									primary: "#ef4444",
									secondary: "#fff",
								},
							},
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
