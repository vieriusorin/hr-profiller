"use client";

import React, { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/shared/components/form-field/";
import { GRADE_OPTIONS } from "@/shared/lib/constants/grades";
import { OPPORTUNITY_LEVEL_OPTIONS } from "@/shared/lib/constants/opportunity-levels";
import { useRoleForm } from "./hooks/useRoleForm";
import { RoleFormProps } from "./types";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useInfiniteEmployees } from "@/lib/hooks/use-employees";
import { InfiniteMultiSelect } from "@/components/ui/infinite-multi-select";
import { apiClient, Role, type Opportunity } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const fetchOpportunities = async (): Promise<Opportunity[]> => {
	const response = await apiClient.opportunities.list();
	return response.data;
};

export const RoleForm = ({
	mode = "create",
	initialData,
	onSubmit,
	onCancel,
	isSubmitting: externalIsSubmitting,
	opportunity,
}: RoleFormProps) => {
	const { form, isSubmitting, handleSubmit, handleCancel } =
		useRoleForm({
			mode,
			initialData,
			onSubmit: async (data) => {
				const response = await onSubmit(data);
				return response;
			},
			onCancel,
			isSubmitting: externalIsSubmitting,
		});

	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;
	const needsHire = watch("needsHire");
	const assignedMemberIds = watch("assignedMemberIds");
	const allocation = watch("allocation");

	const [allocationWarning, setAllocationWarning] = React.useState<string | null>(null);
	const [isSaveDisabled, setIsSaveDisabled] = React.useState(false);

	console.log(initialData, 'initialData')

	const {
		data: employeesData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: isLoadingEmployees,
	} = useInfiniteEmployees({
		limit: 25,
	});

	const employees = useMemo(() => {
		return employeesData?.pages.flatMap((page) => page.data) || [];
	}, [employeesData]);

	const { data: opportunities = [] } = useQuery<Opportunity[]>({
		queryKey: ["opportunities"],
		queryFn: fetchOpportunities,
	});

	useEffect(() => {
		if (needsHire) {
			setValue("assignedMemberIds", []);
		} else {
			setValue("newHireName", "");
		}
	}, [needsHire, setValue]);

	useEffect(() => {
		if (!assignedMemberIds || assignedMemberIds.length === 0 || !opportunity) {
			setAllocationWarning(null);
			setIsSaveDisabled(false);
			return;
		}

		let warningMessage = "";
		let shouldDisable = false;

		const currentOppStartDate = new Date(opportunity.expectedStartDate || "");
		const currentOppEndDate = opportunity.expectedEndDate
			? new Date(opportunity.expectedEndDate)
			: null;

		if (!currentOppEndDate) {
			setAllocationWarning(null);
			setIsSaveDisabled(false);
			return;
		}

		for (const memberId of assignedMemberIds) {
			let allocationFromOtherRoles = 0;
			for (const opp of opportunities) {
				const oppStartDate = new Date(opp.expectedStartDate || "");
				const oppEndDate = opp.expectedEndDate
					? new Date(opp.expectedEndDate)
					: null;

				if (
					!oppEndDate ||
					!(
						oppStartDate <= currentOppEndDate &&
						oppEndDate >= currentOppStartDate
					)
				) {
					continue;
				}

				for (const role of opp.roles || []) {
					if (opportunity.id === opp.id && (initialData as unknown as Role)?.id === role.id) {
						continue;
					}
					if (role.assignedMembers?.some((m) => m.id === memberId)) {
						allocationFromOtherRoles += role.allocation || 0;
					}
				}
			}

			const currentRoleAllocation = allocation || 0;
			const totalAllocation = allocationFromOtherRoles + currentRoleAllocation;
			const employee = employees.find((e) => e.id === memberId);
			const employeeName = employee?.fullName || "Unknown employee";

			if (totalAllocation > 100) {
				warningMessage += `${employeeName} will be over-allocated. Total allocation during this period would be ${totalAllocation}%. `;
				shouldDisable = true;
			} else if (totalAllocation === 100) {
				warningMessage += `${employeeName} will be at 100% allocation for this period. `;
			}
		}

		setAllocationWarning(warningMessage || null);
		setIsSaveDisabled(shouldDisable);
	}, [
		assignedMemberIds,
		allocation,
		opportunities,
		employees,
		opportunity,
		initialData,
	]);

	console.log(watch('assignedMemberIds'), 'watch')

	const employeeOptions = useMemo(
		() =>
			employees.map((emp) => ({
				value: emp.id,
				label: `${emp.fullName} (${emp.position || ""})`,
			})),
		[employees]
	);

	return (
		<div className='space-y-4'>
			<Controller
				name='roleName'
				control={control}
				render={({ field }) => (
					<FormField
						label='Role Name'
						value={field.value}
						onChange={field.onChange}
						placeholder='e.g., Senior Frontend Developer'
						error={errors.roleName?.message}
						required
					/>
				)}
			/>

			<div className='grid grid-cols-2 gap-4'>
				<Controller
					name='requiredGrade'
					control={control}
					render={({ field }) => (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Required Grade</label>
							<Select
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select grade' />
								</SelectTrigger>
								<SelectContent>
									{GRADE_OPTIONS.map((grade) => (
										<SelectItem key={grade.value} value={grade.value}>
											{grade.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.requiredGrade && (
								<p className='text-sm text-red-500'>
									{errors.requiredGrade.message}
								</p>
							)}
						</div>
					)}
				/>

				<Controller
					name='opportunityLevel'
					control={control}
					render={({ field }) => (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Opportunity Level</label>
							<Select
								value={field.value}
								onValueChange={field.onChange}
							>
								<SelectTrigger>
									<SelectValue placeholder='Select level' />
								</SelectTrigger>
								<SelectContent>
									{OPPORTUNITY_LEVEL_OPTIONS.map((level) => (
										<SelectItem key={level.value} value={level.value}>
											{level.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.opportunityLevel && (
								<p className='text-sm text-red-500'>
									{errors.opportunityLevel.message}
								</p>
							)}
						</div>
					)}
				/>
			</div>

			<Controller
				name='allocation'
				control={control}
				render={({ field }) => (
					<FormField
						label='Allocation (%)'
						type='number'
						value={field.value}
						onChange={field.onChange}
						placeholder='e.g., 100'
						error={errors.allocation?.message}
						required
					/>
				)}
			/>

			<Controller
				name='needsHire'
				control={control}
				render={({ field }) => (
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Role Status</label>
						<Select
							value={field.value ? "true" : "false"}
							onValueChange={(value) => field.onChange(value === "true")}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='false'>Assign Existing Employee</SelectItem>
								<SelectItem value='true'>Open for Hire</SelectItem>
							</SelectContent>
						</Select>
						{errors.needsHire && (
							<p className='text-sm text-red-500'>{errors.needsHire.message}</p>
						)}
					</div>
				)}
			/>

			{needsHire ? (
				<Controller
					name='newHireName'
					control={control}
					render={({ field }) => (
						<FormField
							label='New Hire Name (Optional)'
							value={field.value}
							onChange={field.onChange}
							placeholder='e.g., John Doe'
							error={errors.newHireName?.message}
						/>
					)}
				/>
			) : (
				<Controller
					name='assignedMemberIds'
					control={control}
					render={({ field }) => (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>Assigned Members</label>
							<InfiniteMultiSelect
								value={field.value || []}
								onChange={field.onChange}
								options={employeeOptions}
								isLoading={isLoadingEmployees}
								hasNextPage={hasNextPage}
								onFetchNextPage={fetchNextPage}
								isFetchingNextPage={isFetchingNextPage}
								placeholder='Select employees'
							/>
							{errors.assignedMemberIds && (
								<p className='text-sm text-red-500'>
									{errors.assignedMemberIds.message}
								</p>
							)}
						</div>
					)}
				/>
			)}

			<Controller
				name='comments'
				control={control}
				render={({ field }) => (
					<FormField
						label='Comments'
						value={field.value}
						onChange={field.onChange}
						placeholder='Any additional notes or requirements'
						error={errors.comments?.message}
						type='textarea'
						rows={3}
					/>
				)}
			/>

			{allocationWarning && (
				<Alert variant='destructive'>
					<Terminal className='h-4 w-4' />
					<AlertTitle>Allocation Warning</AlertTitle>
					<AlertDescription>{allocationWarning}</AlertDescription>
				</Alert>
			)}

			<div className='flex justify-end space-x-2'>
				<Button
					variant='outline'
					onClick={handleCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					onClick={handleSubmit}
					disabled={isSubmitting || isSaveDisabled}
				>
					{isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
				</Button>
			</div>
		</div>
	);
};