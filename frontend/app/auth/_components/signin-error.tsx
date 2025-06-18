import { SignInErrorProps } from "./types";

export const SignInError = ({ error }: SignInErrorProps) => {
  if (!error) return null;
  
  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
      <p className='text-sm text-red-800'>{error}</p>
    </div>
  );
}; 