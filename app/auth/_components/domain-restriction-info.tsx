import { Shield } from 'lucide-react';

export const DomainRestrictionInfo = () => {
  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
      <div className='flex items-start space-x-3'>
        <Shield className='h-5 w-5 text-blue-600 mt-0.5' />
        <div>
          <h4 className='font-medium text-blue-900'>Domain Restriction</h4>
          <p className='text-sm text-blue-800 mt-1'>
            This application is restricted to employees with @ddroidd.com email addresses. 
            If you are a ddroidd.com employee and still cannot access, please contact IT support.
          </p>
        </div>
      </div>
    </div>
  );
}; 