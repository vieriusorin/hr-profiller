export type ViewMode = 'cards' | 'table';

export type ViewToggleProps = {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
  }
