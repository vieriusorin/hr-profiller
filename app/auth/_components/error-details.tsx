import { ErrorDetailsProps } from "./types";

export const ErrorDetails = ({ errorInfo }: ErrorDetailsProps) => {
  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
      <p className='text-sm text-red-800'>
        {errorInfo.details}
      </p>
    </div>
  );
}; 