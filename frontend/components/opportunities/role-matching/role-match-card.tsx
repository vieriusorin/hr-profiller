"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, TrendingUp, User } from "lucide-react";
import {
	RoleMatch,
	roleMatchingService,
} from "@/lib/services/role-matching.service";

interface RoleMatchCardProps {
	match: RoleMatch;
	showRoleName?: boolean;
	onSelect?: (match: RoleMatch) => void;
}

export const RoleMatchCard = ({
	match,
	showRoleName = true,
	onSelect,
}: RoleMatchCardProps) => {
	const scoreColor = roleMatchingService.getMatchScoreColor(match.matchScore);
	const scoreBgColor = roleMatchingService.getMatchScoreBgColor(
		match.matchScore
	);
	const scoreLabel = roleMatchingService.getMatchScoreLabel(match.matchScore);

	return (
		<Card
			className={`hover:shadow-lg transition-shadow ${
				onSelect ? "cursor-pointer" : ""
			}`}
			onClick={() => onSelect?.(match)}
		>
			<CardHeader>
				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-2'>
						<User className='h-5 w-5 text-muted-foreground' />
						<div>
							<CardTitle className='text-lg'>{match.personName}</CardTitle>
							{showRoleName && (
								<CardDescription className='mt-1'>
									For: <span className='font-medium'>{match.roleName}</span>
								</CardDescription>
							)}
						</div>
					</div>
					<div className={`px-3 py-1 rounded-full ${scoreBgColor}`}>
						<span className={`font-bold ${scoreColor}`}>
							{match.matchScore}%
						</span>
					</div>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Match Score Progress */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between text-sm'>
						<span className='text-muted-foreground'>Match Score</span>
						<Badge variant='outline' className={scoreColor}>
							{scoreLabel}
						</Badge>
					</div>
					<Progress value={match.matchScore} className='h-2' />
				</div>

				{/* Confidence */}
				<div className='flex items-center justify-between text-sm'>
					<span className='text-muted-foreground'>Confidence</span>
					<span className='font-medium'>
						{roleMatchingService.formatConfidence(match.confidence)}
					</span>
				</div>

				{/* Match Reason */}
				<div className='space-y-1'>
					<h4 className='text-sm font-medium flex items-center gap-2'>
						<TrendingUp className='h-4 w-4' />
						Summary
					</h4>
					<p className='text-sm text-muted-foreground'>{match.matchReason}</p>
				</div>

				{/* Strengths */}
				{match.strengths.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium flex items-center gap-2'>
							<CheckCircle2 className='h-4 w-4 text-green-600' />
							Strengths
						</h4>
						<ul className='space-y-1'>
							{match.strengths.slice(0, 3).map((strength, index) => (
								<li
									key={index}
									className='text-sm text-muted-foreground flex items-start gap-2'
								>
									<span className='text-green-600'>•</span>
									<span>{strength}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Gaps */}
				{match.gaps.length > 0 && (
					<div className='space-y-2'>
						<h4 className='text-sm font-medium flex items-center gap-2'>
							<AlertCircle className='h-4 w-4 text-orange-600' />
							Gaps to Address
						</h4>
						<ul className='space-y-1'>
							{match.gaps.slice(0, 3).map((gap, index) => (
								<li
									key={index}
									className='text-sm text-muted-foreground flex items-start gap-2'
								>
									<span className='text-orange-600'>•</span>
									<span>{gap}</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Show more indicator if there are additional items */}
				{(match.strengths.length > 3 ||
					match.gaps.length > 3 ||
					match.recommendations.length > 0) && (
					<p className='text-xs text-muted-foreground text-center'>
						Click to see full details
					</p>
				)}
			</CardContent>
		</Card>
	);
};
