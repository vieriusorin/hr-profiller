export type ViewMode = 'cards' | 'table' | 'gantt';

export type ViewToggleProps = {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}
