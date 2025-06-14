"use client";

import { useSession } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { requirePermission, UserRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { componentThemes } from "@/lib/theme";
import { User } from "next-auth";

const AnalyticsPage = () => {
	const { data: session, status } = useSession();
	const userRole = (session?.user as User)?.role as UserRole;

	useEffect(() => {
		if (status === "loading") return;

		if (!session || !requirePermission(userRole, "view_analytics")) {
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

	if (!session || !requirePermission(userRole, "view_analytics")) {
		return null;
	}

	return (
		<>
			<header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
				<SidebarTrigger className='-ml-1' />
				<Separator orientation='vertical' className='mr-2 h-4' />
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem className='hidden md:block'>
							<BreadcrumbLink href='/dashboard'>Dashboard</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator className='hidden md:block' />
						<BreadcrumbItem>
							<BreadcrumbPage>Analytics</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</header>

			<div className='p-6 max-w-7xl mx-auto w-full'>
				<div className='flex items-center gap-3 mb-6'>
					<div className='flex items-center justify-center w-8 h-8 bg-primary rounded-lg'>
						<BarChart3 className='w-5 h-5 text-white' />
					</div>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>
							Analytics Dashboard
						</h1>
						<p className='text-gray-600 mt-1'>
							Business insights and performance metrics
						</p>
					</div>
				</div>

				{/* Key Metrics */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
					<Card className={componentThemes.card}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Revenue
							</CardTitle>
							<DollarSign className='h-4 w-4 text-primary' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-primary'>$2,847,350</div>
							<p className='text-xs text-gray-600'>
								<span className='text-primary'>+12.5%</span> from last month
							</p>
						</CardContent>
					</Card>

					<Card className={componentThemes.card}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Active Projects
							</CardTitle>
							<Target className='h-4 w-4 text-primary' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-primary'>47</div>
							<p className='text-xs text-gray-600'>
								<span className='text-primary'>+8.2%</span> from last month
							</p>
						</CardContent>
					</Card>

					<Card className={componentThemes.card}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								Total Employees
							</CardTitle>
							<Users className='h-4 w-4 text-primary' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-primary'>284</div>
							<p className='text-xs text-gray-600'>
								<span className='text-primary'>+3.1%</span> from last month
							</p>
						</CardContent>
					</Card>

					<Card className={componentThemes.card}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>Growth Rate</CardTitle>
							<TrendingUp className='h-4 w-4 text-primary' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-primary'>23.4%</div>
							<p className='text-xs text-gray-600'>
								<span className='text-primary'>+2.1%</span> from last month
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Charts and Additional Analytics */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
					<Card className={componentThemes.card}>
						<CardHeader>
							<CardTitle className='text-primary'>Revenue Trends</CardTitle>
							<CardDescription>
								Monthly revenue performance over the last 12 months
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-64 flex items-center justify-center bg-primary/10 rounded-lg'>
								<p className='text-gray-500'>Revenue Chart Placeholder</p>
							</div>
						</CardContent>
					</Card>

					<Card className={componentThemes.card}>
						<CardHeader>
							<CardTitle className='text-primary'>
								Project Status Distribution
							</CardTitle>
							<CardDescription>
								Current status of all active projects
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-64 flex items-center justify-center bg-primary/10 rounded-lg'>
								<p className='text-gray-500'>
									Project Status Chart Placeholder
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Financial Overview (Only for users with financial permissions) */}
				{requirePermission(userRole, "view_client_financials") && (
					<Card className={componentThemes.card}>
						<CardHeader>
							<CardTitle className='text-primary'>Financial Overview</CardTitle>
							<CardDescription>
								Detailed financial metrics and projections
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='p-4 bg-primary/10 rounded-lg'>
									<h3 className='font-semibold text-primary'>Profit Margin</h3>
									<p className='text-2xl font-bold text-primary/90'>34.2%</p>
								</div>
								<div className='p-4 bg-primary/10 rounded-lg'>
									<h3 className='font-semibold text-primary'>
										Operating Costs
									</h3>
									<p className='text-2xl font-bold text-primary/90'>
										$1,876,420
									</p>
								</div>
								<div className='p-4 bg-primary/10 rounded-lg'>
									<h3 className='font-semibold text-primary'>Net Income</h3>
									<p className='text-2xl font-bold text-primary/90'>$970,930</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</>
	);
};

export default AnalyticsPage;
