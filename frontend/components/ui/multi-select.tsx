"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "@/components/ui/badge";

const multiSelectVariants = cva(
	"m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
	{
		variants: {
			variant: {
				default:
					"border-foreground/10 text-foreground bg-card hover:bg-card/80",
				secondary:
					"border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
				inverted: "inverted",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

interface MultiSelectProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof multiSelectVariants> {
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	onValueChange: (value: string[]) => void;
	defaultValue?: string[];
	placeholder?: string;
	animation?: number;
	maxCount?: number;
	asChild?: boolean;
}

export const MultiSelect = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	MultiSelectProps
>(
	(
		{
			options,
			onValueChange,
			variant,
			defaultValue = [],
			placeholder = "Select options",
			animation,
			maxCount,
			className,
			...props
		},
		ref
	) => {
		const [selectedValues, setSelectedValues] =
			React.useState<string[]>(defaultValue);
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

		React.useEffect(() => {
			onValueChange(selectedValues);
		}, [selectedValues, onValueChange]);

		const handleSelect = (value: string) => {
			if (selectedValues.includes(value)) {
				handleRemove(value);
			} else {
				if (maxCount && selectedValues.length >= maxCount) {
					return;
				}
				setSelectedValues((prev) => [...prev, value]);
			}
		};

		const handleRemove = (value: string) => {
			setSelectedValues((prev) => prev.filter((v) => v !== value));
		};

		const togglePopover = () => {
			setIsPopoverOpen((prev) => !prev);
		};

		return (
			<Command ref={ref} className='overflow-visible bg-transparent' {...props}>
				<div
					className={cn(
						"group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
						className
					)}
					onClick={togglePopover}
				>
					<div className='flex flex-wrap gap-1'>
						{selectedValues.map((value) => {
							const option = options.find((o) => o.value === value);
							const Icon = option?.icon;
							return (
								<Badge
									key={value}
									className={cn(multiSelectVariants({ variant }))}
									style={{
										animation: `animation ${animation}s ease-in-out`,
									}}
								>
									{Icon && <Icon className='mr-2 h-4 w-4' />}
									{option?.label}
									<X
										className='ml-2 h-4 w-4 cursor-pointer'
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(value);
										}}
									/>
								</Badge>
							);
						})}
						{selectedValues.length === 0 && (
							<span className='text-muted-foreground'>{placeholder}</span>
						)}
					</div>
				</div>
				{isPopoverOpen && (
					<div className='relative mt-2'>
						<CommandList className='absolute z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => handleSelect(option.value)}
									style={{
										pointerEvents: "auto",
										opacity: 1,
									}}
									className='cursor-pointer'
								>
									<div className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={selectedValues.includes(option.value)}
											readOnly
											className='mr-2'
										/>
										{option.label}
									</div>
								</CommandItem>
							))}
						</CommandList>
					</div>
				)}
			</Command>
		);
	}
);

MultiSelect.displayName = "MultiSelect";
