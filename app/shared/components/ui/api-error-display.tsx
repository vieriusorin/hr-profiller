"use client";

import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiValidationError } from "../../lib/api/validated-api";
import { ApiErrorDisplayProps, ValidationErrorDetailsProps } from "../../types";


export const ApiErrorDisplay = ({
	error,
	onRetry,
	showDetails = false,
	fallbackMessage = "Something went wrong. Please try again.",
}: ApiErrorDisplayProps) => {
	if (!error) return null;

	const isValidationError = error instanceof ApiValidationError;

	return (
		<div className='my-4 p-4 border border-red-200 bg-red-50 rounded-lg'>
			<div className='flex items-center gap-2 mb-2'>
				<XCircle className='h-4 w-4 text-red-600' />
				<div className='flex-1 flex items-center justify-between'>
					<span className='font-medium text-red-800'>
						{isValidationError ? "Data Validation Error" : "Error"}
					</span>
					{onRetry && (
						<Button
							variant='outline'
							size='sm'
							onClick={onRetry}
							className='h-6 px-2 text-xs'
						>
							<RefreshCw className='h-3 w-3 mr-1' />
							Retry
						</Button>
					)}
				</div>
			</div>
			<div className='text-red-700 space-y-2'>
				<div>
					{isValidationError
						? `Failed to validate data from ${error.endpoint}`
						: error.message || fallbackMessage}
				</div>

				{isValidationError && showDetails && (
					<ValidationErrorDetails error={error} />
				)}
			</div>
		</div>
	);
};



const ValidationErrorDetails = ({ error }: ValidationErrorDetailsProps) => {
	const formattedErrors = error.getFormattedErrors();

	return (
		<details className='mt-3 bg-red-50 p-3 rounded border border-red-200'>
			<summary className='cursor-pointer text-sm font-medium text-red-800'>
				View Validation Details
			</summary>
			<div className='mt-2 space-y-2 text-xs'>
				{formattedErrors._errors && formattedErrors._errors.length > 0 && (
					<div>
						<strong>General Errors:</strong>
						<ul className='list-disc list-inside ml-2'>
							{formattedErrors._errors.map((err, index) => (
								<li key={index} className='text-red-700'>
									{err}
								</li>
							))}
						</ul>
					</div>
				)}

				{Object.entries(formattedErrors).map(([field, fieldErrors]) => {
					if (field === "_errors" || !fieldErrors) return null;

					const errors = Array.isArray(fieldErrors)
						? fieldErrors
						: typeof fieldErrors === 'object' && fieldErrors !== null && 'errors' in fieldErrors
						? (fieldErrors as { errors: string[] }).errors 
						: [];

					if (!Array.isArray(errors) || errors.length === 0) return null;

					return (
						<div key={field}>
							<strong>{field}:</strong>
							<ul className='list-disc list-inside ml-2'>
								{errors.map((err, index) => (
									<li key={index} className='text-red-700'>
										{err}
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>
		</details>
	);
};

// Alternative compact error display for inline use
export const InlineApiError = ({
	error,
	className = "text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200",
}: {
	error: ApiValidationError | Error | null;
	className?: string;
}) => {
	if (!error) return null;

	const isValidationError = error instanceof ApiValidationError;

	return (
		<div className={className}>
			<div className='flex items-center gap-2'>
				<AlertCircle className='h-4 w-4 flex-shrink-0' />
				<span>
					{isValidationError
						? `Validation error in ${error.endpoint}`
						: error.message || "An error occurred"}
				</span>
			</div>
		</div>
	);
};

// Loading state component for validated queries
export const ValidatedQueryLoader = ({
	children,
	isLoading,
	error,
	onRetry,
	fallbackData,
	renderFallback,
}: {
	children: React.ReactNode;
	isLoading: boolean;
	error: ApiValidationError | Error | null;
	onRetry?: () => void;
	fallbackData?: any;
	renderFallback?: (data: any) => React.ReactNode;
}) => {
	if (isLoading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<RefreshCw className='h-6 w-6 animate-spin' />
				<span className='ml-2'>Loading...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div>
				<ApiErrorDisplay error={error} onRetry={onRetry} showDetails />
				{fallbackData && renderFallback && (
					<div className='mt-4'>
						<div className='bg-yellow-50 border border-yellow-200 rounded p-3 mb-4'>
							<div className='flex items-center gap-2 text-yellow-800'>
								<AlertCircle className='h-4 w-4' />
								<span className='text-sm font-medium'>
									Showing partially validated data
								</span>
							</div>
						</div>
						{renderFallback(fallbackData)}
					</div>
				)}
			</div>
		);
	}

	return <>{children}</>;
};
