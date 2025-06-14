"use client";

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
	icon?: ReactNode;
}

export const CollapsibleSection = ({
	title,
	children,
	defaultOpen = true,
	icon,
}: CollapsibleSectionProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className='mb-4'>
			<div
				className='flex items-center justify-between cursor-pointer p-4 border rounded-lg bg-card'
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className='flex items-center gap-2'>
					{icon}
					<h2 className='text-lg font-semibold'>{title}</h2>
				</div>
				<ChevronDown
					className={cn("h-5 w-5 transition-transform", {
						"transform rotate-180": isOpen,
					})}
				/>
			</div>
			{isOpen && (
				<div className='p-4 border border-t-0 rounded-b-lg'>{children}</div>
			)}
		</div>
	);
};
