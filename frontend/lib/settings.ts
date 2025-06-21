import { z } from 'zod';

const ganttSettingsSchema = z.object({
  highProbability: z.object({
    backgroundColor: z.string(),
    backgroundSelectedColor: z.string(),
    progressColor: z.string(),
    progressSelectedColor: z.string(),
  }),
  mediumProbability: z.object({
    backgroundColor: z.string(),
    backgroundSelectedColor: z.string(),
    progressColor: z.string(),
    progressSelectedColor: z.string(),
  }),
  lowProbability: z.object({
    backgroundColor: z.string(),
    backgroundSelectedColor: z.string(),
    progressColor: z.string(),
    progressSelectedColor: z.string(),
  }),
  role: z.object({
    progressColor: z.string(),
    progressSelectedColor: z.string(),
  }),
  todayColor: z.string(),
  arrowColor: z.string(),
});

export const settingsSchema = z.object({
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  logoWidth: z.number().optional(),
  logoHeight: z.number().optional(),
  logoAlt: z.string().optional(),
  background: z.string().optional(),
  foreground: z.string().optional(),
  card: z.string().optional(),
  cardForeground: z.string().optional(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  destructive: z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  radius: z.string().optional(),
  primaryForeground: z.string().optional(),
  gantt: ganttSettingsSchema.optional(),
});

export type Settings = z.infer<typeof settingsSchema>;

const defaultSettings: Settings = {
  logoUrl: "/default-logo.svg",
  primaryColor: "oklch(0.8780 0.1803 95.1354)",
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

// Simple in-memory settings storage for now
// In a real application, this could be moved to the backend API or localStorage
let currentSettings: Settings = { ...defaultSettings };

export async function getSettings(): Promise<Settings> {
  // Return default settings for now
  // TODO: In the future, this could fetch from the backend API
  return currentSettings;
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  // Update in-memory settings
  // TODO: In the future, this could save to the backend API
  currentSettings = {
    ...currentSettings,
    ...settings,
    gantt: settings.gantt
      ? { ...currentSettings.gantt, ...settings.gantt }
      : currentSettings.gantt,
  };

  return currentSettings;
} 