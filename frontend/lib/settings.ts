import { z } from 'zod';
import defaultSettings from '../whitelabel-settings.json';

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

const settings: Settings = {
  ...defaultSettings,
};

// Simple in-memory settings storage for now
// In a real application, this could be moved to the backend API or localStorage
let currentSettings: Settings = { ...settings };

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