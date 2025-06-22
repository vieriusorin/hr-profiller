import { OpportunityLevel } from "@/lib/types";

export type OpportunityLevelOption = {
  value: OpportunityLevel;
  label: string;
};

export const OPPORTUNITY_LEVEL_OPTIONS: OpportunityLevelOption[] = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

export const OPPORTUNITY_LEVEL_LABELS: Record<OpportunityLevel, string> = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low'
}; 