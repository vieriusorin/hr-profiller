"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	CheckCircle2,
	AlertCircle,
	Lightbulb,
	TrendingUp,
	User,
} from "lucide-react";
import {
	RoleMatch,
	roleMatchingService,
} from "@/lib/services/role-matching.service";
import { Separator } from "@/components/ui/separator";

interface RoleMatchDetailDialogProps {
	match: RoleMatch | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const RoleMatchDetailDialog = ({
	match,
	open,
	onOpenChange,
}: RoleMatchDetailDialogProps) => {
	if (!match) return null;

	const scoreColor = roleMatchingService.getMatchScoreColor(match.matchScore);
	const scoreBgColor = roleMatchingService.getMatchScoreBgColor(
		match.matchScore
	);
	const scoreLabel = roleMatchingService.getMatchScoreLabel(match.matchScore);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-start justify-between mb-2'>
						<div className='flex items-center gap-2'>
							<User className='h-6 w-6 text-muted-foreground' />
							<div>
								<DialogTitle className='text-xl'>
									{match.personName}
								</DialogTitle>
								<DialogDescription className='mt-1'>
									Matching for:{" "}
									<span className='font-medium text-foreground'>
										{match.roleName}
									</span>
								</DialogDescription>
							</div>
						</div>
						<div className={`px-4 py-2 rounded-full ${scoreBgColor}`}>
							<span className={`font-bold text-lg ${scoreColor}`}>
								{match.matchScore}%
							</span>
						</div>
					</div>
				</DialogHeader>

				<div className='space-y-6 mt-4'>
					{/* Match Score Section */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-medium'>Overall Match Score</h3>
							<Badge variant='outline' className={scoreColor}>
								{scoreLabel}
							</Badge>
						</div>
						<Progress value={match.matchScore} className='h-3' />
						<div className='flex items-center justify-between text-sm text-muted-foreground'>
							<span>
								AI Confidence:{" "}
								{roleMatchingService.formatConfidence(match.confidence)}
							</span>
							<span>Score: {match.matchScore}/100</span>
						</div>
					</div>

					<Separator />

					{/* Match Analysis */}
					<div className='space-y-2'>
						<h3 className='text-sm font-medium flex items-center gap-2'>
							<TrendingUp className='h-4 w-4' />
							Match Analysis
						</h3>
						<p className='text-sm text-muted-foreground leading-relaxed'>
							{match.matchReason}
						</p>
					</div>

					{/* Strengths Section */}
					{match.strengths.length > 0 && (
						<>
							<Separator />
							<div className='space-y-3'>
								<h3 className='text-sm font-medium flex items-center gap-2'>
									<CheckCircle2 className='h-4 w-4 text-green-600' />
									Key Strengths ({match.strengths.length})
								</h3>
								<ul className='space-y-2'>
									{match.strengths.map((strength, index) => (
										<li key={index} className='text-sm flex items-start gap-2'>
											<span className='text-green-600 mt-0.5'>✓</span>
											<span className='text-muted-foreground'>{strength}</span>
										</li>
									))}
								</ul>
							</div>
						</>
					)}

					{/* Gaps Section */}
					{match.gaps.length > 0 && (
						<>
							<Separator />
							<div className='space-y-3'>
								<h3 className='text-sm font-medium flex items-center gap-2'>
									<AlertCircle className='h-4 w-4 text-orange-600' />
									Skill Gaps to Address ({match.gaps.length})
								</h3>
								<ul className='space-y-2'>
									{match.gaps.map((gap, index) => (
										<li key={index} className='text-sm flex items-start gap-2'>
											<span className='text-orange-600 mt-0.5'>△</span>
											<span className='text-muted-foreground'>{gap}</span>
										</li>
									))}
								</ul>
							</div>
						</>
					)}

					{/* Recommendations Section */}
					{match.recommendations.length > 0 && (
						<>
							<Separator />
							<div className='space-y-3'>
								<h3 className='text-sm font-medium flex items-center gap-2'>
									<Lightbulb className='h-4 w-4 text-blue-600' />
									Recommendations ({match.recommendations.length})
								</h3>
								<ul className='space-y-2'>
									{match.recommendations.map((recommendation, index) => (
										<li key={index} className='text-sm flex items-start gap-2'>
											<span className='text-blue-600 mt-0.5'>💡</span>
											<span className='text-muted-foreground'>
												{recommendation}
											</span>
										</li>
									))}
								</ul>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};
