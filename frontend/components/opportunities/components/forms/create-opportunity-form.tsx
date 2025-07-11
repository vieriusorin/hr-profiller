"use client";

import { Button } from "@/components/ui/button";
import { Range } from "@/components/ui/range";
import { FormField } from "@/shared/components/form-field/";
import { useCreateOpportunityForm } from "./hooks/useCreateOpportunityForm";
import { Controller } from "react-hook-form";
import { CreateOpportunityFormProps } from "./types";

export const CreateOpportunityForm = ({
	onSubmit,
	onCancel,
	initialData,
	mode = "create",
	isSubmitting: externalIsSubmitting,
	disabled = false,
}: CreateOpportunityFormProps) => {

	const { form, handleSubmit, handleCancel, isSubmitting, isDirty } =
		useCreateOpportunityForm({
			onSubmit,
			onCancel,
			initialData,
			mode,
			isSubmitting: externalIsSubmitting,
		});

	const {
		control,
		formState: { errors },
	} = form;

	const isEdit = mode === "edit";

	return (
		<div className='space-y-4'>
			<div className='space-y-4'>
				<Controller
					name='clientName'
					control={control}
					render={({ field }) => (
						<FormField
							label='Client Name'
							value={field.value}
							onChange={field.onChange}
							error={errors.clientName?.message}
							required
							disabled={disabled}
						/>
					)}
				/>

				<Controller
					name='opportunityName'
					control={control}
					render={({ field }) => (
						<FormField
							label='Opportunity Name'
							value={field.value}
							onChange={field.onChange}
							error={errors.opportunityName?.message}
							required
							disabled={disabled}
						/>
					)}
				/>

				<Controller
					name='expectedStartDate'
					control={control}
					render={({ field }) => (
						<FormField
							label='Expected Start Date'
							type='date'
							value={field.value ? new Date(field.value) : undefined}
							onChange={(date) => {
								const isoString = date instanceof Date ? date.toISOString() : undefined;
								field.onChange(isoString);
							}}
							error={errors.expectedStartDate?.message}
							placeholder='Select start date'
							required
							disabled={disabled}
						/>
					)}
				/>

				<Controller
					name='expectedEndDate'
					control={control}
					render={({ field }) => (
						<FormField
							label='Expected End Date'
							type='date'
							value={field.value ? new Date(field.value) : undefined}
							onChange={(date) => {
								const isoString = date instanceof Date ? date.toISOString() : undefined;
								field.onChange(isoString);
							}}
							error={errors.expectedEndDate?.message}
							placeholder='Select end date'
							disabled={disabled}
						/>
					)}
				/>

				<Controller
					name='probability'
					control={control}
					render={({ field }) => (
						<div className='space-y-2'>
							<label className='text-sm font-medium'>
								Probability
								<span className='text-red-500 ml-1'>*</span>
							</label>
							<Range
								value={field.value}
								onChange={field.onChange}
								min={0}
								max={100}
								step={10}
								showLabels={true}
								showValue={true}
								className='mt-2'
								disabled={disabled}
							/>
							{errors.probability && (
								<div className='flex items-center gap-1 text-red-600 text-sm'>
									<span className='h-3 w-3'>⚠</span>
									{errors.probability.message}
								</div>
							)}
						</div>
					)}
				/>

				<Controller
					name='comment'
					control={control}
					render={({ field }) => (
						<div className='space-y-1'>
							<label htmlFor='comment' className='block text-sm font-medium'>
								Comment
							</label>
							<textarea
								id='comment'
								className='w-full border rounded p-2 text-sm'
								value={field.value}
								onChange={field.onChange}
								rows={3}
								disabled={disabled}
							/>
							{errors.comment && (
								<span className='text-xs text-red-500'>
									{errors.comment.message}
								</span>
							)}
						</div>
					)}
				/>
			</div>

			<div className='flex gap-2 justify-start'>
				<Button
					onClick={handleSubmit}
					disabled={
						(disabled || externalIsSubmitting) ??
						(isSubmitting || (isEdit && !isDirty))
					}
				>
					{externalIsSubmitting || isSubmitting
						? mode === "create"
							? "Creating..."
							: "Saving..."
						: mode === "create"
						? "Create Opportunity"
						: "Save Changes"}
				</Button>
				<Button
					variant='outline'
					onClick={handleCancel}
					disabled={(disabled || externalIsSubmitting) ?? isSubmitting}
				>
					Cancel
				</Button>
			</div>
		</div>
	);
};
