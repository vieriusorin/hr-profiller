'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AccountPage() {
  return (
    <>
      <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mr-2 h-4'
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Account Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className='p-6 max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <Settings className='h-8 w-8 text-yellow-600' />
            Account Settings
          </h1>
          <p className='text-gray-600 mt-1'>Manage your account preferences and profile</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>
              This page will contain account settings functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              Coming soon - Profile settings, preferences, security settings, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 
