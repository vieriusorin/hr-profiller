import { Skeleton } from "@/components/ui/skeleton";
import { 
  SidebarProvider, 
  SidebarInset,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { TrendingUp, Filter } from "lucide-react";

// Sidebar Loading Skeleton
const SidebarSkeleton = () => (
  <Sidebar>
    <SidebarHeader>
      <div className='flex items-center gap-2 px-4 py-3'>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>
          <Skeleton className="h-4 w-20" />
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {Array.from({ length: 6 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton>
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-16" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="w-4 h-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
);

// Header Loading Skeleton
const HeaderSkeleton = () => (
  <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
    <SidebarTrigger className='-ml-1' />
    <Separator orientation='vertical' className='mr-2 h-4' />
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </header>
);

// Quick Stats Skeleton
const QuickStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

// Collapsible Section Skeleton
const CollapsibleSectionSkeleton = ({ title, icon, children }: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode 
}) => (
  <div className="space-y-4 mb-6">
    <div className="flex items-center gap-2 text-lg font-semibold">
      {icon}
      <span>{title}</span>
    </div>
    <div className="bg-white rounded-lg border p-6">
      {children}
    </div>
  </div>
);

// Filters Skeleton
const FiltersSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-18" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

// Opportunity Cards Skeleton
const OpportunityCardsSkeleton = () => (
  <div className="space-y-6">
    {/* Tabs Skeleton */}
    <div className="flex space-x-1 bg-muted rounded-lg p-1 w-fit">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-md" />
      ))}
    </div>
    
    {/* Cards Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="space-y-1">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Loading() {
  return (
    <SidebarProvider>
      <SidebarSkeleton />
      <SidebarInset>
        <HeaderSkeleton />
        
        <div className="mx-auto w-full p-6">
          {/* Title and Actions */}
          <div className='flex justify-between items-center mb-6'>
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className='flex items-center gap-4'>
              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-16" />
                ))}
              </div>
              {/* New Opportunity Button */}
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Quick Stats Section */}
          <CollapsibleSectionSkeleton
            title='Quick Stats'
            icon={<TrendingUp className='h-5 w-5' />}
          >
            <QuickStatsSkeleton />
          </CollapsibleSectionSkeleton>

          {/* Filters Section */}
          <CollapsibleSectionSkeleton
            title='Filters'
            icon={<Filter className='h-5 w-5' />}
          >
            <FiltersSkeleton />
          </CollapsibleSectionSkeleton>

          {/* Opportunities Content */}
          <OpportunityCardsSkeleton />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}