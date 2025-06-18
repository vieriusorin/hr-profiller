"use client";

import { useFormContext } from "react-hook-form";
import { ColorInput } from "./color-input";
import { SettingsFormValues } from "../schema";

export const ThemeSettings = () => {
	const { control } = useFormContext<SettingsFormValues>();

	return (
		<div>
			<h2 className='text-xl font-semibold mb-4'>Theme Colors</h2>
			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
				<ColorInput name='primaryColor' label='Primary' control={control} />
				<ColorInput
					name='primaryForeground'
					label='Primary Foreground'
					control={control}
				/>
				<ColorInput name='background' label='Background' control={control} />
				<ColorInput name='foreground' label='Foreground' control={control} />
				<ColorInput name='card' label='Card' control={control} />
				<ColorInput
					name='cardForeground'
					label='Card Foreground'
					control={control}
				/>
			</div>
		</div>
	);
};
