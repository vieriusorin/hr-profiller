"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { RoleMatchingProgress } from "@/lib/services/role-matching-sse.service";

interface RoleMatchingProgressBannerProps {
	isVisible: boolean;
	progress: RoleMatchingProgress | null;
	onClose: () => void;
	onViewResults: () => void;
}

export const RoleMatchingProgressBanner = ({
	isVisible,
	progress,
	onClose,
	onViewResults,
}: RoleMatchingProgressBannerProps) => {
	const [showBanner, setShowBanner] = useState(false);

	useEffect(() => {
		if (isVisible && progress) {
			setShowBanner(true);
		}
	}, [isVisible, progress]);

	if (!showBanner || !progress) return null;

	const getIcon = () => {
		switch (progress.type) {
			case "complete":
				return <CheckCircle className='h-4 w-4 text-green-600' />;
			case "error":
				return <AlertCircle className='h-4 w-4 text-red-600' />;
			default:
				return <Loader2 className='h-4 w-4 animate-spin text-blue-600' />;
		}
	};

	const getVariant = () => {
		switch (progress.type) {
			case "complete":
				return "default";
			case "error":
				return "destructive";
			default:
				return "default";
		}
	};

	const handleClose = () => {
		setShowBanner(false);
		onClose();
	};

	return (
		<div className='fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right-5'>
			<Alert variant={getVariant()}>
				<div className='flex items-start justify-between'>
					<div className='flex items-start space-x-3'>
						{getIcon()}
						<div className='flex-1'>
							<AlertDescription className='font-medium'>
								{progress.message}
							</AlertDescription>

							{progress.type === "status" && (
								<div className='mt-2'>
									<Progress value={progress.progress} className='h-2' />
									<p className='text-xs text-muted-foreground mt-1'>
										{progress.progress}% complete
									</p>
								</div>
							)}

							{progress.type === "complete" && progress.data && (
								<div className='mt-2'>
									<p className='text-sm text-muted-foreground'>
										Found {progress.data.totalFound} candidates for this role
									</p>
									<Button size='sm' className='mt-2' onClick={onViewResults}>
										View Results
									</Button>
								</div>
							)}

							{progress.type === "error" && (
								<p className='text-sm text-muted-foreground mt-1'>
									{progress.error}
								</p>
							)}
						</div>
					</div>

					<Button
						variant='ghost'
						size='sm'
						onClick={handleClose}
						className='h-6 w-6 p-0'
					>
						<X className='h-4 w-4' />
					</Button>
				</div>
			</Alert>
		</div>
	);
};
