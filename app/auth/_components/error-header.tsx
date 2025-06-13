import { ErrorIcon } from './error-icon';

export const ErrorHeader = () => {
  return (
    <div className='text-center'>
      <ErrorIcon />
      <h1 className='text-3xl font-bold text-gray-900'>Authentication Error</h1>
      <p className='text-gray-600 mt-2'>Something went wrong during sign in</p>
    </div>
  );
}; 