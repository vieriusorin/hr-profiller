import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const dbPath = path.resolve(process.cwd(), 'db.json');

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

type DB = {
  whitelabel: Settings;
  [key: string]: unknown;
};

async function readDb(): Promise<DB> {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent) as DB;
  } catch (error) {
    console.error("Failed to read or parse db.json:", error)
    return { whitelabel: {} };
  }
}

async function writeDb(data: DB): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

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

export async function getSettings(): Promise<Settings> {
  const db = await readDb();
  const dbSettings = db.whitelabel || {};

  const ganttSettings = dbSettings.gantt
    ? { ...defaultSettings.gantt, ...dbSettings.gantt }
    : defaultSettings.gantt;

  return {
    ...defaultSettings,
    ...dbSettings,
    gantt: ganttSettings,
  };
}

export async function updateSettings(settings: Partial<Settings>) {
  const db = await readDb();

  const newSettings = {
    ...db.whitelabel,
    ...settings,
  };

  db.whitelabel = newSettings;
  await writeDb(db);
  return newSettings;
} 