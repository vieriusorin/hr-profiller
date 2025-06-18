export interface CredentialsSignInRequest {
  email: string;
  password: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface UseSignInReturn {
  // Form data
  formData: SignInFormData;
  error: string | null;
  isLoading: boolean;
  
  // Form handlers
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCredentialsSignIn: (e: React.FormEvent) => void;
  handleMicrosoftSignIn: () => void;
  setDemoAccount: (email: string, password: string) => void;
  
  // Individual mutation states
  isCredentialsLoading: boolean;
  isMicrosoftLoading: boolean;
} 