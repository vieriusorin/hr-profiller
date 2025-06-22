import { Opportunity } from "@/lib/api-client";

export type QuickStatsCardProps = {
  opportunities: Opportunity[];
  onHoldOpportunities: Opportunity[];
  completedOpportunities: Opportunity[];
}

export type StatCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}