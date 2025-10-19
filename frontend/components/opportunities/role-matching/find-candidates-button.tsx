"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { FindCandidatesDialog } from "./find-candidates-dialog";

interface FindCandidatesButtonProps {
	roleId: string;
	roleName?: string;
	variant?: "default" | "outline" | "ghost" | "secondary";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
}

export const FindCandidatesButton = ({
	roleId,
	roleName,
	variant = "outline",
	size = "sm",
	className,
}: FindCandidatesButtonProps) => {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			<Button
				variant={variant}
				size={size}
				onClick={() => setDialogOpen(true)}
				className={className}
			>
				<Sparkles className='h-4 w-4 mr-2' />
				Find Candidates
			</Button>

			<FindCandidatesDialog
				roleId={roleId}
				roleName={roleName}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</>
	);
};
