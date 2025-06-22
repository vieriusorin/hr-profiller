"use client";

import {
	CheckCircle,
	XCircle,
	AlertCircle,
	UserCheck,
	Circle,
} from "lucide-react";
import { RoleStatus } from "@/lib/backend-types/enums";

interface RoleStatusIconProps {
	status: RoleStatus;
}

export const RoleStatusIcon = ({ status }: RoleStatusIconProps) => {
	switch (status) {
		case "Open":
			return <Circle className='h-4 w-4 text-gray-600' />;
		case "Won":
			return <CheckCircle className='h-4 w-4 text-emerald-600' />;
		case "Lost":
			return <XCircle className='h-4 w-4 text-gray-600' />;
		case "Staffed":
			return <UserCheck className='h-4 w-4 text-yellow-600' />;
		default:
			return <AlertCircle className='h-4 w-4 text-red-600' />;
	}
};
