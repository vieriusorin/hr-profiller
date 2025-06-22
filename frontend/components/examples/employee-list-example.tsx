"use client";

import { useEmployees, useCreateEmployee } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, User } from "lucide-react";
import type { Employee } from "@/lib/api-client";

/**
 * Example component demonstrating type-safe API integration
 * Shows how to use the generated types and React Query hooks
 */
export function EmployeeListExample() {
	// Type-safe data fetching with React Query
	const {
		data: employeesResponse,
		isLoading,
		error,
		refetch,
	} = useEmployees({
		page: 1,
		limit: 10,
		employeeStatus: "Active",
	});

	// Type-safe mutations
	const createEmployeeMutation = useCreateEmployee();

	// Example create function with full type safety
	const handleCreateEmployee = () => {
		createEmployeeMutation.mutate({
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@example.com",
			phone: "+1-555-0123",
			address: "123 Main St",
			city: "New York",
			country: "USA",
			hireDate: "2024-01-15",
			position: "Software Engineer",
			location: "New York Office",
			salary: 75000,
			employmentType: "Full-time",
			workStatus: "Available",
			employeeStatus: "Active",
		});
	};

	if (isLoading) {
		return (
			<Card className='w-full max-w-4xl mx-auto'>
				<CardContent className='flex items-center justify-center p-6'>
					<Loader2 className='h-6 w-6 animate-spin mr-2' />
					Loading employees...
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className='w-full max-w-4xl mx-auto'>
				<CardContent className='flex items-center justify-center p-6'>
					<div className='text-center'>
						<p className='text-destructive mb-4'>
							Error loading employees:{" "}
							{error instanceof Error ? error.message : "Unknown error"}
						</p>
						<Button onClick={() => refetch()} variant='outline'>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const employees = employeesResponse?.data || [];
	const meta = employeesResponse?.meta;

	return (
		<div className='w-full max-w-4xl mx-auto space-y-6'>
			{/* Header */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5' />
							Employees ({meta?.count || 0})
						</CardTitle>
						<Button
							onClick={handleCreateEmployee}
							disabled={createEmployeeMutation.isPending}
							className='flex items-center gap-2'
						>
							{createEmployeeMutation.isPending ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<Plus className='h-4 w-4' />
							)}
							Add Employee
						</Button>
					</div>
				</CardHeader>
			</Card>

			{/* Employee List */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{employees.map((employee: Employee) => (
					<Card key={employee.id} className='hover:shadow-md transition-shadow'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-lg'>{employee.fullName}</CardTitle>
							<p className='text-sm text-muted-foreground'>{employee.email}</p>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div>
								<p className='font-medium'>{employee.position}</p>
								<p className='text-sm text-muted-foreground'>
									{employee.location}
								</p>
							</div>

							<div className='flex gap-2 flex-wrap'>
								<Badge
									variant={
										employee.employeeStatus === "Active"
											? "default"
											: "secondary"
									}
								>
									{employee.employeeStatus}
								</Badge>
								<Badge variant='outline'>{employee.workStatus}</Badge>
								{employee.jobGrade && (
									<Badge variant='outline'>{employee.jobGrade}</Badge>
								)}
							</div>

							<div className='text-sm text-muted-foreground'>
								<p>Experience: {employee.yearsOfExperience} years</p>
								{employee.salary && (
									<p>Salary: ${employee.salary.toLocaleString()}</p>
								)}
							</div>

							{/* Skills preview */}
							{employee.skills && employee.skills.length > 0 && (
								<div>
									<p className='text-sm font-medium mb-1'>Skills:</p>
									<div className='flex gap-1 flex-wrap'>
										{employee.skills.slice(0, 3).map((skill, index) => (
											<Badge
												key={index}
												variant='secondary'
												className='text-xs'
											>
												{skill.name}
											</Badge>
										))}
										{employee.skills.length > 3 && (
											<Badge variant='secondary' className='text-xs'>
												+{employee.skills.length - 3} more
											</Badge>
										)}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Empty State */}
			{employees.length === 0 && (
				<Card>
					<CardContent className='flex flex-col items-center justify-center p-12'>
						<User className='h-12 w-12 text-muted-foreground mb-4' />
						<h3 className='text-lg font-semibold mb-2'>No employees found</h3>
						<p className='text-muted-foreground text-center mb-4'>
							Get started by adding your first employee to the system.
						</p>
						<Button onClick={handleCreateEmployee}>
							<Plus className='h-4 w-4 mr-2' />
							Add First Employee
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Pagination info */}
			{employeesResponse?.pagination && (
				<Card>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between text-sm text-muted-foreground'>
							<span>
								Showing {employees.length} of{" "}
								{employeesResponse.pagination.total} employees
							</span>
							<span>
								Page {employeesResponse.pagination.page} of{" "}
								{employeesResponse.pagination.totalPages}
							</span>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
