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
import { Loader2, Users, Sparkles } from "lucide-react";
import {
	RoleMatch,
	roleMatchingService,
} from "@/lib/services/role-matching.service";
import { RoleMatchCard } from "./role-match-card";
import { RoleMatchDetailDialog } from "./role-match-detail-dialog";
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
	const [matches, setMatches] = useState<RoleMatch[]>([]);
	const [loading, setLoading] = useState(false);
	const [limit, setLimit] = useState(10);
	const [selectedMatch, setSelectedMatch] = useState<RoleMatch | null>(null);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);

	const handleFindCandidates = async () => {
		console.log('🎯 [Dialog V1] Find Candidates button clicked - ORIGINAL VERSION (NO SSE)');
		console.log('🎯 [Dialog V1] Role ID:', roleId);
		console.log('🎯 [Dialog V1] Role Name:', roleName);
		console.log('🎯 [Dialog V1] Limit:', limit);
		
		if (!roleId) return;

		console.log('🚀 [Dialog V1] Starting regular API call (no SSE)...');
		setLoading(true);
		try {
			const results = await roleMatchingService.getTopCandidatesForRole(
				roleId,
				limit
			);
			setMatches(results);

			if (results.length === 0) {
				toast(
					"No candidates found that meet the criteria. Try adjusting the filters."
				);
			} else {
				toast.success(
					`Found ${results.length} potential candidates for this role.`
				);
			}
		} catch (error) {
			toast.error("Failed to find candidates. Please try again.");
			console.error("Find candidates error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleMatchClick = (match: RoleMatch) => {
		setSelectedMatch(match);
		setDetailDialogOpen(true);
	};

	const handleDialogOpenChange = (newOpen: boolean) => {
		onOpenChange(newOpen);
		if (!newOpen) {
			// Reset state when closing
			setMatches([]);
			setSelectedMatch(null);
		}
	};

	return (
		<>
			<Dialog open={open} onOpenChange={handleDialogOpenChange}>
				<DialogContent className='max-w-4xl max-h-[90vh]'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Sparkles className='h-5 w-5 text-purple-600' />
							Find Best Candidates
						</DialogTitle>
						<DialogDescription>
							{roleName ? (
								<>
									Using AI to find the best matching candidates for:{" "}
									<span className='font-medium text-foreground'>
										{roleName}
									</span>
								</>
							) : (
								"Using AI to find the best matching candidates for this role"
							)}
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-6'>
						{/* Search Controls */}
						<div className='flex items-end gap-4'>
							<div className='flex-1 space-y-2'>
								<Label htmlFor='limit'>Number of Candidates</Label>
								<Input
									id='limit'
									type='number'
									min={1}
									max={50}
									value={limit}
									onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
									placeholder='Enter number of candidates...'
								/>
							</div>
							<Button
								onClick={handleFindCandidates}
								disabled={loading || !roleId}
								className='gap-2'
							>
								{loading ? (
									<>
										<Loader2 className='h-4 w-4 animate-spin' />
										Analyzing...
									</>
								) : (
									<>
										<Users className='h-4 w-4' />
										Find Candidates
									</>
								)}
							</Button>
						</div>

						{/* Results */}
						{matches.length > 0 && (
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<h3 className='text-sm font-medium flex items-center gap-2'>
										<Users className='h-4 w-4' />
										Top Candidates ({matches.length})
									</h3>
									<span className='text-sm text-muted-foreground'>
										Sorted by match score
									</span>
								</div>

								<div className='h-[500px] overflow-y-auto pr-4'>
									<div className='grid gap-4'>
										{matches.map((match) => (
											<RoleMatchCard
												key={`${match.personId}-${match.roleId}`}
												match={match}
												showRoleName={false}
												onSelect={handleMatchClick}
											/>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Empty State */}
						{!loading && matches.length === 0 && (
							<div className='text-center py-12 text-muted-foreground'>
								<Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
								<p className='text-sm'>
									Click &quot;Find Candidates&quot; to start AI-powered matching
								</p>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Detail Dialog */}
			<RoleMatchDetailDialog
				match={selectedMatch}
				open={detailDialogOpen}
				onOpenChange={setDetailDialogOpen}
			/>
		</>
	);
};
