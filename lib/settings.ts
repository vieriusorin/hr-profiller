import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

// A more specific type for our whitelabel settings
type WhiteLabelSettings = {
  logoUrl?: string;
  primaryColor?: string;
  logoWidth?: number;
  logoHeight?: number;
  logoAlt?: string;
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  secondary?: string;
  accent?: string;
  destructive?: string;
  border?: string;
  input?: string;
  radius?: string;
  primaryForeground?: string;
};

// Using a generic type for the database for now to avoid complexity
type DB = {
  whitelabel: WhiteLabelSettings;
  [key: string]: unknown;
};

async function readDb(): Promise<DB> {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent) as DB;
  } catch (error) {
    console.error("Failed to read or parse db.json:", error)
    // If the file can't be read, return a default structure
    return { whitelabel: {} };
  }
}

async function writeDb(data: DB): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function getWhiteLabelSettings() {
  const db = await readDb();
  if (!db.whitelabel || Object.keys(db.whitelabel).length === 0) {
    return {
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
    };
  }
  return db.whitelabel;
}

export async function updateWhiteLabelSettings(settings: WhiteLabelSettings) {
  const db = await readDb();

  const newSettings = {
    ...db.whitelabel,
    ...settings,
  };

  db.whitelabel = newSettings;
  await writeDb(db);
  return newSettings;
} 