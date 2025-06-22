"use client";

import { Badge } from "@/components/ui/badge";
import { OpportunityStatus, RoleStatus } from "@/lib/backend-types/enums";

interface StatusBadgeProps {
	status: OpportunityStatus | RoleStatus;
}

const STATUS_CONFIG = {
	"In Progress": "bg-blue-100 text-blue-800",
	"On Hold": "bg-yellow-100 text-yellow-800",
	Open: "bg-gray-100 text-gray-800",
	Staffed: "bg-yellow-100 text-yellow-800",
	Won: "bg-emerald-100 text-emerald-800",
	Lost: "bg-gray-100 text-gray-800",
	Done: "bg-purple-100 text-purple-800",
} as const;

export const StatusBadge = ({ status }: StatusBadgeProps) => {
	const colorClasses = STATUS_CONFIG[status] || STATUS_CONFIG["Open"];

	return <Badge className={colorClasses}>{status}</Badge>;
};
