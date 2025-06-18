import { Control } from "react-hook-form";
import { SettingsFormValues } from "./schema";

export type SettingsData = {
  primaryColor?: string;
  logoUrl?: string;
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

export type GanttFieldNames =
  | "gantt.todayColor"
  | "gantt.arrowColor"
  | "gantt.highProbability.backgroundColor"
  | "gantt.highProbability.backgroundSelectedColor"
  | "gantt.highProbability.progressColor"
  | "gantt.highProbability.progressSelectedColor"
  | "gantt.mediumProbability.backgroundColor"
  | "gantt.mediumProbability.backgroundSelectedColor"
  | "gantt.mediumProbability.progressColor"
  | "gantt.mediumProbability.progressSelectedColor"
  | "gantt.lowProbability.backgroundColor"
  | "gantt.lowProbability.backgroundSelectedColor"
  | "gantt.lowProbability.progressColor"
  | "gantt.lowProbability.progressSelectedColor"
  | "gantt.role.progressColor"
  | "gantt.role.progressSelectedColor";

export type ColorInputProps = {
  name: keyof SettingsFormValues;
  label: string;
  control: Control<SettingsFormValues>;
};

export type GeneralSettingsProps = {
  logoPreview: string | null;
  handleLogoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}