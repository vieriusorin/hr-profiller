"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	roleMatchingSSEService,
	RoleMatchingProgress,
} from "@/lib/services/role-matching-sse.service";
import { RoleMatchingProgressBanner } from "./role-matching-progress-banner";
import { RoleMatchingResultsModal } from "./role-matching-results-modal";
import { RoleMatch } from "@/lib/services/role-matching.service";
import { Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface FindCandidatesDialogProps {
	roleId: string | null;
	roleName?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const FindCandidatesDialog = ({
	roleId,
	roleName,
	open,
	onOpenChange,
}: FindCandidatesDialogProps) => {
	const [limit, setLimit] = useState(10);
	const [isStarting, setIsStarting] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [progress, setProgress] = useState<RoleMatchingProgress | null>(null);
	const [candidates, setCandidates] = useState<RoleMatch[]>([]);
	const [showResults, setShowResults] = useState(false);

	const handleFindCandidates = async () => {
		console.log('🎯 [Dialog V2] Find Candidates button clicked - SSE VERSION');
		console.log('🎯 [Dialog V2] Role ID:', roleId);
		console.log('🎯 [Dialog V2] Role Name:', roleName);
		console.log('🎯 [Dialog V2] Limit:', limit);
		
		if (!roleId) {
			console.error('❌ [Dialog V2] No role selected');
			toast.error("No role selected");
			return;
		}

		console.log('🚀 [Dialog V2] Starting SSE role matching process...');
		setIsStarting(true);
		setCandidates([]);

		// Set initial progress immediately to show the banner
		const initialProgress: RoleMatchingProgress = {
			type: "status",
			message: "Connecting to AI service...",
			progress: 0,
		};
		setProgress(initialProgress);
		setShowProgress(true);

		// Close the modal immediately
		onOpenChange(false);

		try {
			await roleMatchingSSEService.startRoleMatching(
				roleId,
				limit,
				(progressData) => {
					setProgress(progressData);
					console.log("Progress update:", progressData);
				},
				(results) => {
					setCandidates(results);
					setShowResults(true);
					setShowProgress(false);
					toast.success(`Found ${results.length} candidates!`);
				},
				(error) => {
					setShowProgress(false);
					setProgress(null);
					toast.error(`Failed to find candidates: ${error}`);
				}
			);
		} catch (error) {
			setShowProgress(false);
			setProgress(null);
			toast.error("Failed to start candidate search");
			console.error("SSE Error:", error);
		} finally {
			setIsStarting(false);
		}
	};

	const handleClose = () => {
		roleMatchingSSEService.close();
		setShowProgress(false);
		setProgress(null);
		setCandidates([]);
		setShowResults(false);
		onOpenChange(false);
	};

	const handleViewResults = () => {
		setShowResults(true);
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Sparkles className='h-5 w-5 text-purple-600' />
							Find Best Candidates
						</DialogTitle>
						<DialogDescription>
							Using AI to find the best matching candidates for:{" "}
							<strong>{roleName}</strong>
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='limit'>Number of Candidates</Label>
							<Input
								id='limit'
								type='number'
								min='1'
								max='50'
								value={limit}
								onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
								placeholder='Enter number of candidates'
							/>
						</div>

						<div className='flex justify-end space-x-2'>
							<Button variant='outline' onClick={handleClose}>
								Cancel
							</Button>
							<Button
								onClick={handleFindCandidates}
								disabled={isStarting || !roleId}
								className='bg-purple-600 hover:bg-purple-700'
							>
								{isStarting ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Starting...
									</>
								) : (
									<>
										<Sparkles className='mr-2 h-4 w-4' />
										Find Candidates
									</>
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Progress Banner */}
			<RoleMatchingProgressBanner
				isVisible={showProgress}
				progress={progress}
				onClose={() => setShowProgress(false)}
				onViewResults={handleViewResults}
			/>

			{/* Results Modal */}
			<RoleMatchingResultsModal
				open={showResults}
				onOpenChange={setShowResults}
				candidates={candidates}
				roleName={roleName || "Unknown Role"}
				roleId={roleId || ""}
			/>
		</>
	);
};
