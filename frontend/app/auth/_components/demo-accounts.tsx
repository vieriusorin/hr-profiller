import { DemoAccountsProps } from "./types";

export const DemoAccounts = ({ setDemoAccount }: DemoAccountsProps) => {
  return (
    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
      <p className='text-sm text-yellow-800 font-semibold mb-3'>🧪 Demo Accounts for Testing:</p>
      <div className='space-y-2 text-xs'>
        <div className='grid grid-cols-2 gap-2'>
          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
            <p className='font-medium text-red-700'>👑 Admin</p>
            <p className='text-yellow-800'>admin@ddroidd.com</p>
            <p className='text-gray-600'>Full access + financials</p>
          </div>
          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
            <p className='font-medium text-blue-700'>👥 HR Manager</p>
            <p className='text-yellow-800'>hr.manager@ddroidd.com</p>
            <p className='text-gray-600'>HR without financials</p>
          </div>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
            <p className='font-medium text-yellow-700'>🎯 Recruiter</p>
            <p className='text-yellow-800'>recruiter@ddroidd.com</p>
            <p className='text-gray-600'>Candidates only</p>
          </div>
          <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
            <p className='font-medium text-purple-700'>👤 Employee</p>
            <p className='text-yellow-800'>employee@ddroidd.com</p>
            <p className='text-gray-600'>Basic project access</p>
          </div>
        </div>
        <div className='bg-white rounded px-2 py-1 border border-yellow-300'>
          <p className='font-medium text-gray-700'>🔒 Basic User</p>
          <p className='text-yellow-800'>user@ddroidd.com</p>
          <p className='text-gray-600'>Dashboard only</p>
        </div>
        <div className='mt-3 pt-2 border-t border-yellow-300'>
          <p className='text-yellow-700 font-medium mb-2'>All passwords: <code className='bg-yellow-100 px-1 rounded'>password123</code></p>
          <div className='flex flex-wrap gap-1'>
            <button
              type='button'
              onClick={() => setDemoAccount('admin@ddroidd.com', 'password123')}
              className='text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors'
            >
              Use Admin
            </button>
            <button
              type='button'
              onClick={() => setDemoAccount('hr.manager@ddroidd.com', 'password123')}
              className='text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors'
            >
              Use HR
            </button>
            <button
              type='button'
              onClick={() => setDemoAccount('recruiter@ddroidd.com', 'password123')}
              className='text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors'
            >
              Use Recruiter
            </button>
            <button
              type='button'
              onClick={() => setDemoAccount('employee@ddroidd.com', 'password123')}
              className='text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded transition-colors'
            >
              Use Employee
            </button>
            <button
              type='button'
              onClick={() => setDemoAccount('user@ddroidd.com', 'password123')}
              className='text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded transition-colors'
            >
              Use User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 