"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

type Settings = {
	primaryColor: string;
	logoUrl: string;
	logoWidth: number;
	logoHeight: number;
	logoAlt: string;
	background: string;
	foreground: string;
	card: string;
	cardForeground: string;
	secondary: string;
	accent: string;
	destructive: string;
	border: string;
	input: string;
	radius: string;
	primaryForeground: string;
};

type ThemeContextType = {
	settings: Settings;
	setSettings: (settings: Settings) => void;
	isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
	settings: {
		primaryColor: "oklch(0.63 0.22 264)", // Default primary color
		logoUrl: "",
		logoWidth: 100,
		logoHeight: 40,
		logoAlt: "Company Logo",
		background: "oklch(0.9911 0 0)",
		foreground: "oklch(0.2046 0 0)",
		card: "oklch(0.9911 0 0)",
		cardForeground: "oklch(0.2046 0 0)",
		secondary: "oklch(0.9940 0 0)",
		accent: "oklch(0.9461 0 0)",
		destructive: "oklch(0.5523 0.1927 32.7272)",
		border: "oklch(0.9037 0 0)",
		input: "oklch(0.9731 0 0)",
		radius: "0.5rem",
		primaryForeground: "oklch(0.2626 0.0147 166.4589)",
	},
	setSettings: () => {},
	isLoading: true,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [settings, setSettingsState] = useState<Settings>({
		primaryColor: "oklch(0.63 0.22 264)",
		logoUrl: "",
		logoWidth: 100,
		logoHeight: 40,
		logoAlt: "Company Logo",
		background: "oklch(0.9911 0 0)",
		foreground: "oklch(0.2046 0 0)",
		card: "oklch(0.9911 0 0)",
		cardForeground: "oklch(0.2046 0 0)",
		secondary: "oklch(0.9940 0 0)",
		accent: "oklch(0.9461 0 0)",
		destructive: "oklch(0.5523 0.1927 32.7272)",
		border: "oklch(0.9037 0 0)",
		input: "oklch(0.9731 0 0)",
		radius: "0.5rem",
		primaryForeground: "oklch(0.2626 0.0147 166.4589)",
	});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSettings = async () => {
			setIsLoading(true);
			try {
				const response = await fetch("/api/whitelabel");
				if (!response.ok) {
					throw new Error("Failed to fetch settings");
				}
				const fetchedSettings = await response.json();
				if (fetchedSettings) {
					setSettingsState({
						primaryColor:
							fetchedSettings.primaryColor || "oklch(0.63 0.22 264)",
						logoUrl: fetchedSettings.logoUrl || "",
						logoWidth: fetchedSettings.logoWidth || 100,
						logoHeight: fetchedSettings.logoHeight || 40,
						logoAlt: fetchedSettings.logoAlt || "Company Logo",
						background: fetchedSettings.background || "oklch(0.9911 0 0)",
						foreground: fetchedSettings.foreground || "oklch(0.2046 0 0)",
						card: fetchedSettings.card || "oklch(0.9911 0 0)",
						cardForeground:
							fetchedSettings.cardForeground || "oklch(0.2046 0 0)",
						secondary: fetchedSettings.secondary || "oklch(0.9940 0 0)",
						accent: fetchedSettings.accent || "oklch(0.9461 0 0)",
						destructive:
							fetchedSettings.destructive || "oklch(0.5523 0.1927 32.7272)",
						border: fetchedSettings.border || "oklch(0.9037 0 0)",
						input: fetchedSettings.input || "oklch(0.9731 0 0)",
						radius: fetchedSettings.radius || "0.5rem",
						primaryForeground:
							fetchedSettings.primaryForeground ||
							"oklch(0.2626 0.0147 166.4589)",
					});
				}
			} catch (error) {
				console.error("Failed to fetch settings:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchSettings();
	}, []);

	// Apply theme to document
	useEffect(() => {
		const applySettings = () => {
			const style = document.documentElement.style;
			style.setProperty("--primary", settings.primaryColor);
			style.setProperty("--background", settings.background);
			style.setProperty("--foreground", settings.foreground);
			style.setProperty("--card", settings.card);
			style.setProperty("--card-foreground", settings.cardForeground);
			style.setProperty("--secondary", settings.secondary);
			style.setProperty("--accent", settings.accent);
			style.setProperty("--destructive", settings.destructive);
			style.setProperty("--border", settings.border);
			style.setProperty("--input", settings.input);
			style.setProperty("--radius", settings.radius);
			style.setProperty("--primary-foreground", settings.primaryForeground);
		};
		applySettings();
	}, [
		settings.primaryColor,
		settings.background,
		settings.foreground,
		settings.card,
		settings.cardForeground,
		settings.secondary,
		settings.accent,
		settings.destructive,
		settings.border,
		settings.input,
		settings.radius,
		settings.primaryForeground,
	]);

	const setSettings = (newSettings: Partial<Settings>) => {
		setSettingsState((prev) => ({ ...prev, ...newSettings }));
	};

	return (
		<ThemeContext.Provider value={{ settings, setSettings, isLoading }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
