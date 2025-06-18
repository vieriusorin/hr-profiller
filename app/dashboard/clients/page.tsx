"use client";

import { useSession } from "next-auth/react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Users,
	Building,
	DollarSign,
	Plus,
	Eye,
	EyeOff,
	AlertTriangle,
	Phone,
	Mail,
} from "lucide-react";
import { requirePermission, UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { componentThemes } from "@/lib/theme";
import { User } from "next-auth";

export default function ClientsPage() {
	const { data: session, status } = useSession();

	const userRole = (session?.user as User)?.role as UserRole;

	useEffect(() => {
		if (status === "loading") return;

		if (!session || !requirePermission(userRole, "view_clients")) {
			redirect("/dashboard");
		}
	}, [session, status, userRole]);

	if (status === "loading") {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (!session || !requirePermission(userRole, "view_clients")) {
		return null;
	}

	const canViewFinancials = requirePermission(
		userRole,
		"view_client_financials"
	);
	const canCreateClients = requirePermission(userRole, "create_clients");
	const canEditClients = requirePermission(userRole, "edit_clients");

	// Mock client data
	const clients = [
		{
			id: 1,
			name: "TechCorp Solutions",
			contactPerson: "John Smith",
			email: "john.smith@techcorp.com",
			phone: "+1 (555) 123-4567",
			status: "Active",
			projectsCount: 5,
			revenue: 2450000,
			lastContact: "2024-01-15",
		},
		{
			id: 2,
			name: "InnovateLabs Inc.",
			contactPerson: "Sarah Johnson",
			email: "sarah@innovatelabs.com",
			phone: "+1 (555) 987-6543",
			status: "Active",
			projectsCount: 3,
			revenue: 1850000,
			lastContact: "2024-01-12",
		},
		{
			id: 3,
			name: "Digital Dynamics",
			contactPerson: "Mike Chen",
			email: "mike.chen@digitaldynamics.com",
			phone: "+1 (555) 456-7890",
			status: "Inactive",
			projectsCount: 1,
			revenue: 750000,
			lastContact: "2023-12-20",
		},
	];
	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
				<SidebarTrigger className='-ml-1' />
				<Separator orientation='vertical' className='mr-2 h-4' />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbPage>Clients</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</header>

			<div className='p-6 mx-auto w-full'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold flex items-center gap-2'>
						<Users className='h-8 w-8 text-primary' />
						Clients
					</h1>
					<p className='text-gray-600 mt-1'>
						Manage your client relationships and accounts
					</p>
				</div>

				{/* Action Bar */}
				<div className='flex justify-between items-center mb-6'>
					<div className='flex items-center gap-2'>
						{!canViewFinancials && (
							<div className='flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-lg'>
								<EyeOff className='w-4 h-4' />
								<span className='text-sm'>Financial data hidden</span>
							</div>
						)}
					</div>
					{canCreateClients && (
						<Button className='bg-primary hover:bg-primary/90 text-primary-foreground'>
							<Plus className='w-4 h-4 mr-2' />
							Add Client
						</Button>
					)}
				</div>

				{/* Client Cards */}
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{clients.map((client) => (
						<Card key={client.id} className={componentThemes.card}>
							<CardHeader className='pb-3'>
								<div className='flex items-start justify-between'>
									<div className='flex items-center gap-2'>
										<Building className='w-5 h-5 text-primary' />
										<CardTitle className='text-lg'>{client.name}</CardTitle>
									</div>
									<Badge
										variant={
											client.status === "Active" ? "default" : "secondary"
										}
										className={
											client.status === "Active"
												? "bg-primary/10 text-primary"
												: ""
										}
									>
										{client.status}
									</Badge>
								</div>
								<CardDescription>
									Contact: {client.contactPerson}
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								{/* Contact Information */}
								<div className='space-y-2'>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Mail className='w-4 h-4' />
										{client.email}
									</div>
									<div className='flex items-center gap-2 text-sm text-gray-600'>
										<Phone className='w-4 h-4' />
										{client.phone}
									</div>
								</div>

								{/* Project Count */}
								<div className='flex items-center justify-between py-2 border-t border-gray-100'>
									<span className='text-sm text-gray-600'>Projects</span>
									<Badge variant='outline'>{client.projectsCount}</Badge>
								</div>

								{/* Financial Information - Only shown to authorized users */}
								{canViewFinancials ? (
									<div className='flex items-center justify-between py-2 border-t border-gray-100'>
										<span className='text-sm text-gray-600'>Revenue</span>
										<div className='flex items-center gap-1'>
											<DollarSign className='w-4 h-4 text-primary' />
											<span className='font-semibold text-primary'>
												${client.revenue.toLocaleString()}
											</span>
										</div>
									</div>
								) : (
									<div className='flex items-center justify-between py-2 border-t border-gray-100'>
										<span className='text-sm text-gray-600'>Revenue</span>
										<div className='flex items-center gap-1 text-gray-400'>
											<EyeOff className='w-4 h-4' />
											<span className='text-sm'>Hidden</span>
										</div>
									</div>
								)}

								{/* Last Contact */}
								<div className='flex items-center justify-between py-2 border-t border-gray-100'>
									<span className='text-sm text-gray-600'>Last Contact</span>
									<span className='text-sm font-medium'>
										{client.lastContact}
									</span>
								</div>

								{/* Actions */}
								<div className='flex gap-2 pt-3'>
									<Button variant='outline' size='sm' className='flex-1'>
										<Eye className='w-4 h-4 mr-1' />
										View
									</Button>
									{canEditClients && (
										<Button variant='outline' size='sm' className='flex-1'>
											Edit
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Empty State for users without permissions */}
				{clients.length === 0 && (
					<Card className='border-primary/20'>
						<CardContent className='flex flex-col items-center justify-center py-12'>
							<AlertTriangle className='w-12 h-12 text-gray-400 mb-4' />
							<p className='text-gray-600 text-center'>
								No clients available or you don&apos;t have permission to view
								them.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
}
