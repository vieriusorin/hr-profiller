export type ActiveStatusBadgeProps = {
    isActive: boolean;
    activatedAt?: string | null;
    size?: 'sm' | 'md' | 'lg';
    showActivatedDate?: boolean;
    autoActivated?: boolean; // If it was auto-activated based on probability
    onToggle?: () => void; // Click handler for toggling status
    isLoading?: boolean; // Show loading state during API call
  }
  