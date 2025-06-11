// Centralized theme configuration
export const theme = {
  colors: {
    primary: {
      50: 'yellow-50',
      100: 'yellow-100',
      200: 'yellow-200',
      300: 'yellow-300',
      400: 'yellow-400',
      500: 'yellow-500',
      600: 'yellow-600',
      700: 'yellow-700',
      800: 'yellow-800',
      900: 'yellow-900',
    },
    accent: {
      50: 'amber-50',
      100: 'amber-100',
      200: 'amber-200',
      300: 'amber-300',
      400: 'amber-400',
      500: 'amber-500',
      600: 'amber-600',
      700: 'amber-700',
      800: 'amber-800',
      900: 'amber-900',
    },
    background: {
      light: 'yellow-50',
      base: 'yellow-100',
      dark: 'amber-100',
    },
    border: {
      light: 'yellow-200',
      base: 'yellow-300',
      dark: 'yellow-400',
    },
    text: {
      primary: 'yellow-900',
      secondary: 'yellow-800',
      muted: 'yellow-700',
      light: 'yellow-600',
    }
  },
  gradients: {
    background: 'from-yellow-50 to-amber-100',
    card: 'from-yellow-100 to-amber-50',
    button: 'from-yellow-600 to-amber-600',
  }
};

// Utility functions for consistent styling
export const getThemeClasses = {
  // Button styles
  button: {
    primary: `bg-${theme.colors.primary[600]} hover:bg-${theme.colors.primary[700]} text-white`,
    secondary: `bg-${theme.colors.primary[100]} hover:bg-${theme.colors.primary[200]} text-${theme.colors.primary[800]}`,
    outline: `border-${theme.colors.primary[300]} text-${theme.colors.primary[700]} hover:bg-${theme.colors.primary[50]}`,
  },
  
  // Background styles
  background: {
    page: `bg-${theme.colors.background.light}`,
    card: `bg-white border-${theme.colors.border.light}`,
    section: `bg-${theme.colors.background.base}`,
  },
  
  // Text styles
  text: {
    heading: `text-${theme.colors.text.primary}`,
    body: `text-${theme.colors.text.secondary}`,
    muted: `text-${theme.colors.text.muted}`,
    light: `text-${theme.colors.text.light}`,
  },
  
  // Icon styles
  icon: {
    primary: `text-${theme.colors.primary[600]}`,
    secondary: `text-${theme.colors.primary[500]}`,
    muted: `text-${theme.colors.primary[400]}`,
  },
  
  // Border styles
  border: {
    light: `border-${theme.colors.border.light}`,
    base: `border-${theme.colors.border.base}`,
    dark: `border-${theme.colors.border.dark}`,
  },
  
  // Loading/spinner styles
  loading: {
    spinner: `border-${theme.colors.primary[600]}`,
    background: `bg-${theme.colors.background.light}`,
  },
  
  // Role-specific colors (for badges, indicators)
  roles: {
    admin: 'bg-red-100 text-red-800',
    hr_manager: 'bg-blue-100 text-blue-800',
    recruiter: `bg-${theme.colors.primary[100]} text-${theme.colors.primary[800]}`,
    employee: 'bg-purple-100 text-purple-800',
    user: 'bg-gray-100 text-gray-800',
  }
};

// Utility function to get classes as string
export const tc = (classPath: string): string => {
  const pathArray = classPath.split('.');
  let current: any = getThemeClasses;
  
  for (const key of pathArray) {
    current = current[key];
    if (!current) return '';
  }
  
  return current;
};

// Direct color values for programmatic use
export const themeColors = {
  primary: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  accent: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  }
};

// Helper for dynamic class generation
export const generateThemeClass = (property: string, shade: number = 600) => {
  return `${property}-yellow-${shade}`;
};

// Common component theme presets
export const componentThemes = {
  card: `bg-white border-yellow-200 hover:shadow-lg transition-shadow`,
  header: `border-b border-yellow-200 bg-yellow-50`,
  sidebar: {
    header: `border-b border-yellow-200 bg-yellow-50`,
    content: `bg-white`,
    footer: `border-t border-yellow-200`,
  },
  button: {
    primary: `bg-yellow-600 hover:bg-yellow-700 text-white`,
    secondary: `bg-yellow-100 hover:bg-yellow-200 text-yellow-800`,
    outline: `border-yellow-300 text-yellow-700 hover:bg-yellow-50`,
  },
  input: `border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500`,
  badge: {
    default: `bg-yellow-100 text-yellow-800`,
    active: `bg-yellow-600 text-white`,
  },
  alert: {
    info: `bg-yellow-50 border-yellow-200 text-yellow-800`,
    warning: `bg-amber-50 border-amber-200 text-amber-800`,
  }
}; 