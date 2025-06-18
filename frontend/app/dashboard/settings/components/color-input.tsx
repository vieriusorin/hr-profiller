"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { ColorInputProps } from "../types";
import { AnyColorPicker } from "../utils/any-color-picker";
import { useColorInput } from "../hooks/use-color-input";

export const ColorInput: React.FC<ColorInputProps> = ({
	name,
	label,
	control,
}) => {
	const { handleColorChange, hexColor } = useColorInput(name, control);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<div className='flex items-center gap-4'>
						<FormControl>
							<Input
								type='text'
								value={hexColor}
								onChange={(e) => handleColorChange(e.target.value, field)}
								className='w-28'
							/>
						</FormControl>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className='w-10 h-10 p-0 border'
									style={{ backgroundColor: field.value as string }}
								/>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0 border-none'>
								<AnyColorPicker
									color={hexColor}
									onChange={(newHexColor: string) =>
										handleColorChange(newHexColor, field)
									}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
