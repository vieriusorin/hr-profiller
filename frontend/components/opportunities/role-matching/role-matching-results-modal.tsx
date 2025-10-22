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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoleMatchCard } from "./role-match-card";
import { RoleMatchDetailDialog } from "./role-match-detail-dialog";
import { RoleMatch } from "@/lib/services/role-matching.service";
import { Users, Sparkles, TrendingUp } from "lucide-react";

interface RoleMatchingResultsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	candidates: RoleMatch[];
	roleName: string;
	roleId: string;
}

export const RoleMatchingResultsModal = ({
	open,
	onOpenChange,
	candidates,
	roleName,
	roleId,
}: RoleMatchingResultsModalProps) => {
	const [selectedMatch, setSelectedMatch] = useState<RoleMatch | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);

	console.log(roleId)

	const handleMatchClick = (match: RoleMatch) => {
		setSelectedMatch(match);
		setDetailOpen(true);
	};

	const averageScore =
		candidates.length > 0
			? Math.round(
					candidates.reduce((sum, match) => sum + match.matchScore, 0) /
						candidates.length
			  )
			: 0;

	const topCandidates = candidates.slice(0, 3);
	const otherCandidates = candidates.slice(3);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='max-w-4xl max-h-[80vh]'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Sparkles className='h-5 w-5 text-purple-600' />
							AI-Powered Candidate Results
						</DialogTitle>
						<DialogDescription>
							Found {candidates.length} potential candidates for{" "}
							<strong>{roleName}</strong>
						</DialogDescription>
					</DialogHeader>

					<div className='space-y-6'>
						{/* Summary Stats */}
						<div className='grid grid-cols-3 gap-4'>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center space-x-2'>
										<Users className='h-4 w-4 text-blue-600' />
										<div>
											<p className='text-sm font-medium'>Total Candidates</p>
											<p className='text-2xl font-bold'>{candidates.length}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center space-x-2'>
										<TrendingUp className='h-4 w-4 text-green-600' />
										<div>
											<p className='text-sm font-medium'>Average Score</p>
											<p className='text-2xl font-bold'>{averageScore}%</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center space-x-2'>
										<Sparkles className='h-4 w-4 text-purple-600' />
										<div>
											<p className='text-sm font-medium'>AI Analysis</p>
											<Badge variant='secondary'>Complete</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Top Candidates */}
						{topCandidates.length > 0 && (
							<div>
								<h3 className='text-lg font-semibold mb-3'>Top Candidates</h3>
								<div className='grid gap-4'>
									{topCandidates.map((match) => (
										<RoleMatchCard
											key={`${match.personId}-${match.roleId}`}
											match={match}
											showRoleName={false}
											onSelect={() => handleMatchClick(match)}
										/>
									))}
								</div>
							</div>
						)}

						{/* Other Candidates */}
						{otherCandidates.length > 0 && (
							<div>
								<h3 className='text-lg font-semibold mb-3'>Other Candidates</h3>
								<ScrollArea className='h-64'>
									<div className='grid gap-3'>
										{otherCandidates.map((match) => (
											<RoleMatchCard
												key={`${match.personId}-${match.roleId}`}
												match={match}
												showRoleName={false}
												onSelect={() => handleMatchClick(match)}
											/>
										))}
									</div>
								</ScrollArea>
							</div>
						)}

						{/* Actions */}
						<div className='flex justify-end space-x-2'>
							<Button variant='outline' onClick={() => onOpenChange(false)}>
								Close
							</Button>
							<Button onClick={() => onOpenChange(false)}>
								View All Candidates
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Detail Dialog */}
			<RoleMatchDetailDialog
				open={detailOpen}
				onOpenChange={setDetailOpen}
				match={selectedMatch}
			/>
		</>
	);
};
