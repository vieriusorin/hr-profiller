import { DashboardTitleProps } from "../_types";

export const DashboardTitle = ({ isRefetching }: DashboardTitleProps) => {
  return (
    <div>
      <h1 className='text-3xl font-bold flex items-center gap-2'>
        Opportunity Dashboard
        {isRefetching && (
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
        )}
      </h1>
      <p className='text-gray-600 mt-1'>Manage client opportunities and resource allocation</p>
    </div>
  );
}; 