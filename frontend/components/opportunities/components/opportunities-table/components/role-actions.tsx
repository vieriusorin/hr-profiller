import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, MoreHorizontal, UserCheck, XCircle } from "lucide-react";
import { RoleActionsProps } from "../types";

export const RoleActions = ({
	opportunityId,
	roleId,
	roleName,
	onStatusClick,
}: RoleActionsProps) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button size='sm' variant='outline' className='h-6 w-6 p-0'>
					<MoreHorizontal className='h-3 w-3' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='w-32'>
				<DropdownMenuItem
					onClick={() => onStatusClick(opportunityId, roleId, "Won", roleName)}
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
					onClick={() => onStatusClick(opportunityId, roleId, "Lost", roleName)}
					className='text-red-600'
				>
					<XCircle className='h-3 w-3 mr-2 text-red-600' />
					Lost
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
