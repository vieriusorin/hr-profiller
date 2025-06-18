"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

export default function ProjectsPage() {
	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
				<SidebarTrigger className='-ml-1' />
				<Separator orientation='vertical' className='mr-2 h-4' />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbPage>Projects</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</header>

			<div className='p-6 mx-auto w-full'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold flex items-center gap-2'>
						<FolderOpen className='h-8 w-8 text-primary' />
						Projects
					</h1>
					<p className='text-gray-600 mt-1'>
						Manage your active projects and deliverables
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Project Management</CardTitle>
						<CardDescription>
							This page will contain project management functionality
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-muted-foreground'>
							Coming soon - Project list, timelines, milestones, team
							assignments, and more.
						</p>
					</CardContent>
				</Card>
			</div>
		</>
	);
}
