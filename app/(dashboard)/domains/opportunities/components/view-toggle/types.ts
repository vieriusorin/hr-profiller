export type ViewMode = 'cards' | 'table';

export interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
  }
