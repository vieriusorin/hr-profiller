import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { headers } from 'next/headers';
import { queryKeys } from '@/shared/lib/query/keys';
import { validatedOpportunityApi } from '@/shared/lib/api/validated-api';
import { Grade, OpportunityFilters } from '@/shared/types';

function parseFiltersFromParams(
  searchParams: { [key: string]: string | string[] | undefined }
): OpportunityFilters {
  const client = typeof searchParams.client === 'string' ? searchParams.client : '';

  let grades: Grade[] = [];
  const gradesParam = searchParams.grades;
  if (typeof gradesParam === 'string') {
    grades = gradesParam.split(',') as Grade[];
  } else if (Array.isArray(gradesParam)) {
    grades = gradesParam as Grade[];
  }

  const needsHireParam = searchParams.needsHire;
  const needsHire: 'all' | 'yes' | 'no' =
    needsHireParam === 'yes' || needsHireParam === 'no' ? needsHireParam : 'all';

  let probability: [number, number] = [0, 100];
  const probParam = searchParams.probability;
  if (typeof probParam === 'string') {
    const parts = probParam.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      probability = [parts[0], parts[1]];
    }
  }

  return { client, grades, needsHire, probability };
}

async function getWhitelabelSettings() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  const response = await fetch(`${protocol}://${host}/api/whitelabel`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }
  return response.json();
}

export default async function DashboardLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const queryClient = new QueryClient();
  const filters = parseFiltersFromParams(searchParams || {});

  // Prefetch whitelabel settings
  await queryClient.prefetchQuery({
    queryKey: ['whitelabel-settings'],
    queryFn: getWhitelabelSettings,
  });

  // Prefetch in-progress opportunities
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.opportunities.inProgress(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const result =
        await validatedOpportunityApi.getInProgressOpportunities(
          filters,
          pageParam
        );
      if (result.success) {
        return result.data;
      }
      throw result.error;
    },
    initialPageParam: 1,
  });

  // Prefetch on-hold opportunities
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.opportunities.onHold(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await validatedOpportunityApi.getOnHoldOpportunities(
        filters,
        pageParam
      );
      if (result.success) {
        return result.data;
      }
      throw result.error;
    },
    initialPageParam: 1,
  });

  // Prefetch completed opportunities
  await queryClient.prefetchInfiniteQuery({
    queryKey: queryKeys.opportunities.completed(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await validatedOpportunityApi.getCompletedOpportunities(
        filters,
        pageParam
      );
      if (result.success) {
        return result.data;
      }
      throw result.error;
    },
    initialPageParam: 1,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  );
} 
