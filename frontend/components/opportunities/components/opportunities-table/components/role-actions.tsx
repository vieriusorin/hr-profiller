import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	CheckCircle,
	MoreHorizontal,
	UserCheck,
	XCircle,
	Sparkles,
} from "lucide-react";
import { RoleActionsProps } from "../types";
import { useState } from "react";
import { FindCandidatesDialog } from "@/components/opportunities/role-matching/find-candidates-dialog-v2";

export const RoleActions = ({
	opportunityId,
	roleId,
	roleName,
	onStatusClick,
}: RoleActionsProps) => {
	const [findCandidatesOpen, setFindCandidatesOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button size='sm' variant='outline' className='h-6 w-6 p-0'>
						<MoreHorizontal className='h-3 w-3' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start' className='w-48'>
					<DropdownMenuItem
						onClick={() => setFindCandidatesOpen(true)}
						className='text-purple-600'
					>
						<Sparkles className='h-3 w-3 mr-2 text-purple-600' />
						Find Candidates
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() =>
							onStatusClick(opportunityId, roleId, "Won", roleName)
						}
						className='text-green-600'
					>
						<CheckCircle className='h-3 w-3 mr-2 text-green-600' />
						Won
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							onStatusClick(opportunityId, roleId, "Staffed", roleName)
						}
						className='text-yellow-600'
					>
						<UserCheck className='h-3 w-3 mr-2 text-yellow-600' />
						Staffed
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							onStatusClick(opportunityId, roleId, "Lost", roleName)
						}
						className='text-red-600'
					>
						<XCircle className='h-3 w-3 mr-2 text-red-600' />
						Lost
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<FindCandidatesDialog
				roleId={roleId}
				roleName={roleName}
				open={findCandidatesOpen}
				onOpenChange={setFindCandidatesOpen}
			/>
		</>
	);
};
