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
import { Employee } from "@/shared/types/employees";
import { Input } from "@/components/ui/input";
import { getAvailableEmployees } from "./lib/employee-filtering";
import { MultiSelect } from "@/components/ui/multi-select";
import { Opportunity } from "@/shared/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const fetchEmployees = async (): Promise<Employee[]> => {
	const res = await fetch("/api/employees");
	if (!res.ok) {
		throw new Error("Failed to fetch employees");
	}
	return res.json();
};

const fetchOpportunities = async (): Promise<Opportunity[]> => {
	const res = await fetch("/api/opportunities");
	if (!res.ok) {
		throw new Error("Failed to fetch opportunities");
	}
	return res.json();
};

export const RoleForm = ({
	mode = "create",
	initialData,
	onSubmit,
	onCancel,
	isSubmitting: externalIsSubmitting,
	opportunity,
}: RoleFormProps) => {
	const { form, isSubmitting, handleSubmit, handleCancel, isDirty } =
		useRoleForm({
			mode,
			initialData,
			onSubmit,
			onCancel,
			isSubmitting: externalIsSubmitting,
		});

	const {
		control,
		formState: { errors },
		watch,
		setValue,
	} = form;
	const roleName = watch("roleName");
	const needsHire = watch("needsHire");
	const assignedMemberIds = watch("assignedMemberIds");
	const allocation = watch("allocation");

	const [allocationWarning, setAllocationWarning] = React.useState<
		string | null
	>(null);
	const [isSaveDisabled, setIsSaveDisabled] = React.useState(false);

	const { data: employees = [] } = useQuery<Employee[]>({
		queryKey: ["employees"],
		queryFn: fetchEmployees,
	});

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

		const currentOppStartDate = new Date(opportunity.expectedStartDate);
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
				const oppStartDate = new Date(opp.expectedStartDate);
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

				for (const role of opp.roles) {
					if (opportunity.id === opp.id && initialData?.id === role.id) {
						continue;
					}
					if (role.assignedMemberIds?.includes(memberId)) {
						allocationFromOtherRoles += role.allocation;
					}
				}
			}

			const currentRoleAllocation = allocation || 0;
			const totalAllocation = allocationFromOtherRoles + currentRoleAllocation;
			const employee = employees.find((e) => e.id === memberId);
			const employeeName = employee?.name || "Unknown employee";

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

	const availableEmployees = useMemo(() => {
		return getAvailableEmployees(employees, roleName, opportunity);
	}, [employees, roleName, opportunity]);

	const employeeOptions = useMemo(
		() =>
			availableEmployees.map((emp) => ({
				value: emp.id,
				label: `${emp.name} (${emp.position})`,
			})),
		[availableEmployees]
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

			<div className='space-y-2'>
				<label className='text-sm font-medium'>
					Required Grade
					<span className='text-red-500 ml-1'>*</span>
				</label>
				<Controller
					name='requiredGrade'
					control={control}
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger
								className={errors.requiredGrade ? "border-red-500" : ""}
							>
								<SelectValue placeholder='Select required grade' />
							</SelectTrigger>
							<SelectContent>
								{GRADE_OPTIONS.map((grade) => (
									<SelectItem key={grade.value} value={grade.value}>
										{grade.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.requiredGrade && (
					<div className='flex items-center gap-1 text-red-600 text-sm'>
						<span className='h-3 w-3'>⚠</span>
						{errors.requiredGrade.message}
					</div>
				)}
			</div>

			<div className='space-y-2'>
				<label className='text-sm font-medium'>
					Opportunity Level
					<span className='text-red-500 ml-1'>*</span>
				</label>
				<Controller
					name='opportunityLevel'
					control={control}
					render={({ field }) => (
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger
								className={errors.opportunityLevel ? "border-red-500" : ""}
							>
								<SelectValue placeholder='Select opportunity level' />
							</SelectTrigger>
							<SelectContent>
								{OPPORTUNITY_LEVEL_OPTIONS.map((level) => (
									<SelectItem key={level.value} value={level.value}>
										{level.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.opportunityLevel && (
					<div className='flex items-center gap-1 text-red-600 text-sm'>
						<span className='h-3 w-3'>⚠</span>
						{errors.opportunityLevel.message}
					</div>
				)}
			</div>

			<div className='space-y-2'>
				<label className='text-sm font-medium'>
					Needs Hire?
					<span className='text-red-500 ml-1'>*</span>
				</label>
				<Controller
					name='needsHire'
					control={control}
					render={({ field }) => (
						<Select
							value={
								field.value === true ? "Yes" : field.value === false ? "No" : ""
							}
							onValueChange={(val) => field.onChange(val === "Yes")}
						>
							<SelectTrigger
								className={errors.needsHire ? "border-red-500" : ""}
							>
								<SelectValue placeholder='Select if hire is needed' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='No'>No</SelectItem>
								<SelectItem value='Yes'>Yes</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
				{errors.needsHire && (
					<div className='flex items-center gap-1 text-red-600 text-sm'>
						<span className='h-3 w-3'>⚠</span>
						{errors.needsHire.message}
					</div>
				)}
			</div>

			{!needsHire ? (
				<div className='space-y-2'>
					<label className='text-sm font-medium'>
						Assign Employees (Optional)
					</label>
					<Controller
						name='assignedMemberIds'
						control={control}
						render={({ field }) => (
							<MultiSelect
								options={employeeOptions}
								onValueChange={field.onChange}
								defaultValue={field.value || []}
								placeholder='Select employees'
								variant='inverted'
								animation={2}
								maxCount={5}
							/>
						)}
					/>
					{errors.assignedMemberIds && (
						<div className='flex items-center gap-1 text-red-600 text-sm'>
							<span className='h-3 w-3'>⚠</span>
							{typeof errors.assignedMemberIds.message === "string" &&
								errors.assignedMemberIds.message}
						</div>
					)}
				</div>
			) : (
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
			)}

			{allocationWarning && (
				<Alert variant='destructive'>
					<Terminal className='h-4 w-4' />
					<AlertTitle>Over-allocation Warning</AlertTitle>
					<AlertDescription>{allocationWarning}</AlertDescription>
				</Alert>
			)}

			<div className='space-y-2'>
				<label className='text-sm font-medium'>
					Allocation (%)
					<span className='text-red-500 ml-1'>*</span>
				</label>
				<Controller
					name='allocation'
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type='number'
							min='0'
							max='100'
							placeholder='e.g., 100'
							onChange={(e) =>
								field.onChange(
									e.target.value === "" ? undefined : Number(e.target.value)
								)
							}
							value={field.value || ""}
							className={errors.allocation ? "border-red-500" : ""}
						/>
					)}
				/>
				{errors.allocation && (
					<div className='flex items-center gap-1 text-red-600 text-sm'>
						<span className='h-3 w-3'>⚠</span>
						{errors.allocation.message}
					</div>
				)}
			</div>

			<Controller
				name='comments'
				control={control}
				render={({ field }) => (
					<FormField
						label='Comments (Optional)'
						value={field.value}
						onChange={field.onChange}
						placeholder='Additional requirements or notes...'
						type='textarea'
						rows={3}
						error={errors.comments?.message}
					/>
				)}
			/>

			<div className='flex justify-end gap-2'>
				<Button
					type='button'
					variant='outline'
					onClick={handleCancel}
					disabled={isSubmitting}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={
						isSubmitting || (mode === "edit" && !isDirty) || isSaveDisabled
					}
				>
					{isSubmitting
						? mode === "create"
							? "Adding Role..."
							: "Saving Changes..."
						: mode === "create"
						? "Add Role"
						: "Save Changes"}
				</Button>
			</div>
		</div>
	);
};
