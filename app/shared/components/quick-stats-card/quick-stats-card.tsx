import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserPlus, TrendingUp } from 'lucide-react';
import { Role } from '../../types';
import { QuickStatsCardProps, StatCardProps } from './types';

const StatCard = ({ title, value, icon, description, variant = 'default' }: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getVariantClasses()}`}>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium opacity-70'>{title}</p>
          <p className='text-2xl font-bold'>{value.toLocaleString()}</p>
          {description && (
            <p className='text-xs opacity-60 mt-1'>{description}</p>
          )}
        </div>
        <div className='opacity-60'>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const QuickStatsCard = ({ 
  opportunities, 
  onHoldOpportunities, 
  completedOpportunities 
}: QuickStatsCardProps) => {
  const allOpportunities = [...opportunities, ...onHoldOpportunities, ...completedOpportunities];
  const totalOpportunities = allOpportunities.length;
  
  const totalRoles = allOpportunities.reduce((sum, opp) => sum + opp.roles.length, 0);
  
  const hiringNeededCount = allOpportunities.reduce((sum, opp) => {
    return sum + opp.roles.filter((role: Role) => role.needsHire).length;
  }, 0);

  const activeOpportunities = opportunities.length;
  const completionRate = totalOpportunities > 0 
    ? Math.round((completedOpportunities.length / totalOpportunities) * 100)
    : 0;

  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            title='Total Opportunities'
            value={totalOpportunities}
            icon={<Building2 className='h-8 w-8' />}
            description={`${activeOpportunities} active`}
            variant='info'
          />
          
          <StatCard
            title='Total Roles'
            value={totalRoles}
            icon={<Users className='h-8 w-8' />}
            description={totalOpportunities > 0 ? `${Math.round(totalRoles / totalOpportunities)} avg per opportunity` : ''}
            variant='default'
          />
          
          <StatCard
            title='Hiring Needed'
            value={hiringNeededCount}
            icon={<UserPlus className='h-8 w-8' />}
            description={totalRoles > 0 ? `${Math.round((hiringNeededCount / totalRoles) * 100)}% of roles` : ''}
            variant={hiringNeededCount > 0 ? 'warning' : 'success'}
          />

          <StatCard
            title='Completion Rate'
            value={completionRate}
            icon={<Badge className='h-8 w-8' />}
            description={`${completedOpportunities.length} completed`}
            variant={completionRate >= 70 ? 'success' : completionRate >= 40 ? 'warning' : 'default'}
          />
        </div>
      </CardContent>
    </Card>
  );
}; 