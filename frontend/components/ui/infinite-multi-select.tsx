'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Command, CommandItem, CommandList } from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';
import { Badge } from '@/components/ui/badge';

const infiniteMultiSelectVariants = cva(
	'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
	{
		variants: {
			variant: {
				default:
					'border-foreground/10 text-foreground bg-card hover:bg-card/80',
				secondary:
					'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
				inverted: 'inverted',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
);

interface InfiniteMultiSelectProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
		VariantProps<typeof infiniteMultiSelectVariants> {
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	onChange: (value: string[]) => void;
	value?: string[];
	placeholder?: string;
	animation?: number;
	maxCount?: number;
	asChild?: boolean;
	isLoading?: boolean;
	hasNextPage?: boolean;
	onFetchNextPage?: () => void;
	isFetchingNextPage?: boolean;
}

export const InfiniteMultiSelect = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	InfiniteMultiSelectProps
>(
	(
		{
			options,
			onChange,
			variant,
			value = [],
			placeholder = 'Select options',
			animation,
			maxCount,
			className,
			isLoading = false,
			hasNextPage = false,
			onFetchNextPage,
			isFetchingNextPage = false,
			...props
		},
		ref
	) => {
		const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
		const listRef = React.useRef<HTMLDivElement>(null);

		const handleSelect = (selectedValue: string) => {
			const newValues = value.includes(selectedValue)
				? value.filter((v) => v !== selectedValue)
				: maxCount && value.length >= maxCount
				? value
				: [...value, selectedValue];
			
			onChange(newValues);
		};

		const handleRemove = (valueToRemove: string) => {
			onChange(value.filter((v) => v !== valueToRemove));
		};

		const togglePopover = () => {
			setIsPopoverOpen((prev) => !prev);
		};

		// Handle infinite scroll
		const handleScroll = React.useCallback(
			(e: React.UIEvent<HTMLDivElement>) => {
				const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
				
				// Load more when user scrolls to within 100px of the bottom
				if (
					scrollHeight - scrollTop <= clientHeight + 100 &&
					hasNextPage &&
					!isFetchingNextPage &&
					onFetchNextPage
				) {
					onFetchNextPage();
				}
			},
			[hasNextPage, isFetchingNextPage, onFetchNextPage]
		);

		return (
			//@ts-expect-error - Command is not typed correctly
			<Command ref={ref} className='overflow-visible bg-transparent' {...props}>
				<div
					className={cn(
						'group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
						className
					)}
					onClick={togglePopover}
				>
					<div className='flex flex-wrap gap-1'>
						{value.map((selectedValue) => {
							const option = options.find((o) => o.value === selectedValue);
							const Icon = option?.icon;
							return (
								<Badge
									key={selectedValue}
									className={cn(infiniteMultiSelectVariants({ variant }))}
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
											handleRemove(selectedValue);
										}}
									/>
								</Badge>
							);
						})}
						{value.length === 0 && (
							<span className='text-muted-foreground'>{placeholder}</span>
						)}
					</div>
				</div>
				{isPopoverOpen && (
					<div className='relative mt-2'>
						<CommandList 
							ref={listRef}
							className='absolute z-10 w-full max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'
							onScroll={handleScroll}
						>
							{isLoading && options.length === 0 && (
								<div className='flex items-center justify-center py-6'>
									<Loader2 className='h-4 w-4 animate-spin' />
									<span className='ml-2 text-sm text-muted-foreground'>
										Loading employees...
									</span>
								</div>
							)}
							{options.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => handleSelect(option.value)}
									style={{
										pointerEvents: 'auto',
										opacity: 1,
									}}
									className='cursor-pointer'
								>
									<div className='flex items-center gap-2'>
										<input
											type='checkbox'
											checked={value.includes(option.value)}
											readOnly
											className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
										/>
										{option.icon && (
											<option.icon className='h-4 w-4 text-muted-foreground' />
										)}
										<span>{option.label}</span>
									</div>
								</CommandItem>
							))}
							{hasNextPage && (
								<div className='flex items-center justify-center py-2'>
									{isFetchingNextPage ? (
										<>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span className='ml-2 text-sm text-muted-foreground'>
												Loading more...
											</span>
										</>
									) : (
										<span className='text-sm text-muted-foreground'>
											Scroll to load more
										</span>
									)}
								</div>
							)}
						</CommandList>
					</div>
				)}
			</Command>
		);
	}
);

InfiniteMultiSelect.displayName = 'InfiniteMultiSelect'; 