import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDetails } from './error-details';
import { DomainRestrictionInfo } from './domain-restriction-info';
import { ErrorActions } from './error-actions';
import { ErrorCardProps } from './types';

export const ErrorCard = ({ errorInfo, isAccessDenied }: ErrorCardProps) => {
  return (
    <Card className='shadow-lg border-0'>
      <CardHeader className='text-center pb-4'>
        <CardTitle className='text-xl font-semibold text-red-600'>
          {errorInfo.title}
        </CardTitle>
        <CardDescription>
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <ErrorDetails errorInfo={errorInfo} />
        
        {isAccessDenied && <DomainRestrictionInfo />}
        
        <ErrorActions />
      </CardContent>
    </Card>
  );
}; 