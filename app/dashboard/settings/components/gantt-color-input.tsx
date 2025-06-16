import { Control } from "react-hook-form";
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
import { SettingsFormValues } from "../schema";
import { GanttFieldNames } from "../types";
import { AnyColorPicker } from "../utils/any-color-picker";

export const GanttColorInput: React.FC<{
	name: GanttFieldNames;
	label: string;
	control: Control<SettingsFormValues>;
}> = ({ name, label, control }) => {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<div className='flex items-center gap-4'>
						<FormControl>
							<Input type='text' {...field} className='w-28' />
						</FormControl>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									className='w-10 h-10 p-0 border'
									style={{ backgroundColor: field.value }}
								/>
							</PopoverTrigger>
							<PopoverContent className='w-auto p-0 border-none'>
								<AnyColorPicker color={field.value} onChange={field.onChange} />
							</PopoverContent>
						</Popover>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
};
