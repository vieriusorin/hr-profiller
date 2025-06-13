import { ErrorInfo } from '@/app/hooks/useAuthError';

export type BaseSignInProps = {
    email: string;
    password: string;
    isLoading: boolean;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setDemoAccount: (email: string, password: string) => void;
}

export type SignInCardProps = BaseSignInProps & {
    error: string;
    handleCredentialsSignIn: (e: React.FormEvent) => void;
    handleMicrosoftSignIn: () => void;
}

export type SignInErrorProps = {
    error: string;
}

export type ErrorDetailsProps = {
    errorInfo: ErrorInfo;
}

export type MicrosoftSignInProps = {
    isLoading: boolean;
    handleMicrosoftSignIn: () => void;
}

export type CredentialsFormProps = BaseSignInProps & {
    handleSubmit: (e: React.FormEvent) => void;
}

export type DemoAccountsProps = {
    setDemoAccount: (email: string, password: string) => void;
}

export type ErrorCardProps = {
    errorInfo: ErrorInfo;
    isAccessDenied: boolean;
}