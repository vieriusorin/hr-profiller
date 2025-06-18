"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
	useMemo,
} from "react";
import { Settings, ThemeContextType } from "../types";

const defaultSettings: Settings = {
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
	gantt: {
		highProbability: {
			backgroundColor: "#e8f5e9",
			backgroundSelectedColor: "#c8e6c9",
			progressColor: "#4caf50",
			progressSelectedColor: "#388e3c",
		},
		mediumProbability: {
			backgroundColor: "#fffde7",
			backgroundSelectedColor: "#fff9c4",
			progressColor: "#ffeb3b",
			progressSelectedColor: "#fbc02d",
		},
		lowProbability: {
			backgroundColor: "#ffebee",
			backgroundSelectedColor: "#ffcdd2",
			progressColor: "#f44336",
			progressSelectedColor: "#d32f2f",
		},
		role: {
			progressColor: "#a3a3ff",
			progressSelectedColor: "#8f8fff",
		},
		todayColor: "#d1d4dc",
		arrowColor: "#000",
	},
};

const ThemeContext = createContext<ThemeContextType>({
	settings: defaultSettings,
	setSettings: () => {},
	isLoading: true,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [settings, setSettingsState] = useState<Settings>(defaultSettings);
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
					setSettingsState((prev) => ({ ...prev, ...fetchedSettings }));
				}
			} catch (error) {
				console.error("Error fetching settings:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchSettings();
	}, []);

	const style = useMemo(() => {
		const s = settings;
		const styleObj: React.CSSProperties & { [key: string]: string } = {
			"--background": s.background,
			"--foreground": s.foreground,
			"--card": s.card,
			"--card-foreground": s.cardForeground,
			"--primary": s.primaryColor,
			"--secondary": s.secondary,
			"--accent": s.accent,
			"--destructive": s.destructive,
			"--border": s.border,
			"--input": s.input,
			"--ring": s.primaryColor,
			"--radius": s.radius,
			"--primary-foreground": s.primaryForeground,
		};

		if (s.gantt) {
			const gantt = s.gantt;
			styleObj["--gantt-high-prob-bg"] = gantt.highProbability.backgroundColor;
			styleObj["--gantt-high-prob-bg-selected"] =
				gantt.highProbability.backgroundSelectedColor;
			styleObj["--gantt-high-prob-progress"] =
				gantt.highProbability.progressColor;
			styleObj["--gantt-high-prob-progress-selected"] =
				gantt.highProbability.progressSelectedColor;
			styleObj["--gantt-medium-prob-bg"] =
				gantt.mediumProbability.backgroundColor;
			styleObj["--gantt-medium-prob-bg-selected"] =
				gantt.mediumProbability.backgroundSelectedColor;
			styleObj["--gantt-medium-prob-progress"] =
				gantt.mediumProbability.progressColor;
			styleObj["--gantt-medium-prob-progress-selected"] =
				gantt.mediumProbability.progressSelectedColor;
			styleObj["--gantt-low-prob-bg"] = gantt.lowProbability.backgroundColor;
			styleObj["--gantt-low-prob-bg-selected"] =
				gantt.lowProbability.backgroundSelectedColor;
			styleObj["--gantt-low-prob-progress"] =
				gantt.lowProbability.progressColor;
			styleObj["--gantt-low-prob-progress-selected"] =
				gantt.lowProbability.progressSelectedColor;
			styleObj["--gantt-role-progress"] = gantt.role.progressColor;
			styleObj["--gantt-role-progress-selected"] =
				gantt.role.progressSelectedColor;
			styleObj["--gantt-today-color"] = gantt.todayColor;
			styleObj["--gantt-arrow-color"] = gantt.arrowColor;
		}

		return styleObj;
	}, [settings]);

	useEffect(() => {
		const root = document.documentElement;
		Object.entries(style).forEach(([key, value]) => {
			root.style.setProperty(key, value);
		});
	}, [style]);

	const setSettings = (newSettings: Partial<Settings>) => {
		setSettingsState((prev) => ({
			...prev,
			...newSettings,
		}));
	};

	return (
		<ThemeContext.Provider value={{ settings, setSettings, isLoading }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
