import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { Providers } from './providers';

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
	const settings = await getSettings();
	return (
		<html lang='en' className={cn(outfit.className)} suppressHydrationWarning>
			<body>
				<Providers settings={settings}>
					{children}
				</Providers>
			</body>
		</html>
	);
}
