import { Opportunity } from "../../types";

export interface QuickStatsCardProps {
    opportunities: Opportunity[];
    onHoldOpportunities: Opportunity[];
    completedOpportunities: Opportunity[];
  }
  
  export interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    description?: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
  }