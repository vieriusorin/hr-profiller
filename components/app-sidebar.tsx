"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import {
	Building2,
	Users,
	FolderOpen,
	UserCheck,
	Briefcase,
	Settings,
	LogOut,
	ChevronUp,
	BarChart3,
	Upload,
} from "lucide-react";
import {
	NavigationItem,
	getFilteredNavigation,
	UserRole,
	hasPermission,
} from "@/lib/rbac";
import { componentThemes } from "@/lib/theme";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User } from "next-auth";

// Navigation items with permissions
const navigationItems: NavigationItem[] = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: Building2,
		permission: "view_dashboard",
		description: "Main dashboard with opportunities overview",
	},
	{
		title: "Analytics",
		url: "/dashboard/analytics",
		icon: BarChart3,
		permission: "view_analytics",
		description: "Business analytics and reporting",
	},
	{
		title: "Clients",
		url: "/dashboard/clients",
		icon: Users,
		permission: "view_clients",
		description: "Client management and information",
	},
	{
		title: "Projects",
		url: "/dashboard/projects",
		icon: FolderOpen,
		permission: "view_projects",
		description: "Project management and tracking",
	},
	{
		title: "Candidates",
		url: "/dashboard/candidates",
		icon: UserCheck,
		permission: "view_candidates",
		description: "Candidate management and recruitment",
	},
	{
		title: "Employees",
		url: "/dashboard/employees",
		icon: Briefcase,
		permission: "view_employees",
		description: "Employee directory and management",
	},
];

export const AppSidebar = () => {
	const { data: session } = useSession();
	const router = useRouter();
	const pathname = usePathname();

	// Get user role from session
	const userRole = (session?.user as User)?.role as UserRole;

	// Filter navigation items based on user role
	const allowedNavItems = getFilteredNavigation(
		userRole || "user",
		navigationItems
	);

	// Get role display info
	// const roleInfo = userRole ? ROLE_DISPLAY_INFO[userRole] : null;

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/auth/signin" });
	};

	const handleAccountSettings = () => {
		router.push("/dashboard/account");
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	return (
		<Sidebar>
			<SidebarHeader className={componentThemes.sidebar.header}>
				<div className='flex items-center gap-2 px-4 py-3'>
					<div className='flex items-center justify-center w-8 h-8 bg-primary rounded-lg'>
						<Building2 className='w-5 h-5 text-white' />
					</div>
					<div className='flex flex-col flex-1'>
						<h1 className='font-semibold text-sidebar-foreground'>DDROIDD</h1>
					</div>
					{/* {roleInfo && (
            <div className='flex items-center gap-1'>
              <Shield className='w-3 h-3 text-primary' />
              <span className='text-xs text-primary font-medium'>
                {roleInfo.name}
              </span>
            </div>
          )} */}
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{allowedNavItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<Link href={item.url}>
											<item.icon className='w-4 h-4' />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className={componentThemes.sidebar.footer}>
				{session?.user && (
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
										<Avatar className='w-6 h-6'>
											<AvatarImage src={session.user.image || ""} />
											<AvatarFallback className='text-xs bg-primary text-primary-foreground'>
												{getInitials(
													session.user.name || session.user.email || "U"
												)}
											</AvatarFallback>
										</Avatar>
										<div className='flex flex-col items-start flex-1 text-left'>
											<span className='text-sm font-medium truncate'>
												{session.user.name || "User"}
											</span>
											<span className='text-xs text-sidebar-foreground/70 truncate'>
												{session.user.email}
											</span>
										</div>
										<ChevronUp className='w-4 h-4' />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									side='top'
									className='w-[--radix-popper-anchor-width]'
								>
									<DropdownMenuItem onClick={handleAccountSettings}>
										<Settings className='w-4 h-4 mr-2' />
										Account Settings
									</DropdownMenuItem>
									{hasPermission(userRole, "edit_system_settings") && (
										<DropdownMenuItem
											onClick={() => router.push("/dashboard/settings/import")}
										>
											<Upload className='w-4 h-4 mr-2' />
											Import Data
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleSignOut}>
										<LogOut className='w-4 h-4 mr-2' />
										Sign Out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				)}
			</SidebarFooter>
		</Sidebar>
	);
};
