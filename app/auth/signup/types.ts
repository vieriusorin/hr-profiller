export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
}

export interface UseSignUpReturn {
  mutate: (data: SignUpRequest) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
} 