"use client";

import { useMemo, useEffect, useState, ReactNode } from "react";
import { useForm, Control, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HexColorPicker } from "react-colorful";
import { formatHex, oklch } from "culori";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/app/providers/theme-provider";
import { useUpdateSettingsMutation } from "./hooks/use-settings";
import { settingsSchema, SettingsFormValues } from "./schema";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Image from "next/image";

const AnyColorPicker = HexColorPicker as any;

type ColorInputProps = {
	name: keyof SettingsFormValues;
	label: string;
	control: Control<SettingsFormValues>;
};

const ColorInput: React.FC<ColorInputProps> = ({ name, label, control }) => {
	const { setSettings, settings } = useTheme();

	const handleColorChange = (
		hexColor: string,
		field: ControllerRenderProps<SettingsFormValues, typeof name>
	) => {
		try {
			const oklchColor = oklch(hexColor);
			if (!oklchColor) return;
			const oklchString = `oklch(${oklchColor.l} ${oklchColor.c} ${oklchColor.h})`;
			field.onChange(oklchString);
			setSettings({ ...settings, [name]: oklchString });
		} catch (e) {
			console.error(`Error converting color for ${name}:`, e);
		}
	};

	const hexColor = useMemo(() => {
		const oklchValue = control._getWatch(name) as string | undefined;
		if (!oklchValue) return "#000000";
		try {
			return formatHex(oklchValue);
		} catch {
			return "#000000";
		}
	}, [control, name]);

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
									onChange={(newHexColor: any) =>
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

const SettingsSection = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => (
	<div className='space-y-4 rounded-lg border p-4'>
		<h2 className='text-xl font-bold'>{title}</h2>
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{children}
		</div>
	</div>
);

export default function SettingsPage() {
	const { settings, setSettings, isLoading } = useTheme();
	const { mutate: updateSettings, isPending } = useUpdateSettingsMutation();
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [logoFile, setLogoFile] = useState<File | null>(null);

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			primaryColor: settings.primaryColor,
			logoUrl: settings.logoUrl,
			logoWidth: settings.logoWidth,
			logoHeight: settings.logoHeight,
			logoAlt: settings.logoAlt,
			background: settings.background,
			foreground: settings.foreground,
			card: settings.card,
			cardForeground: settings.cardForeground,
			secondary: settings.secondary,
			accent: settings.accent,
			destructive: settings.destructive,
			border: settings.border,
			input: settings.input,
			radius: settings.radius,
			primaryForeground: settings.primaryForeground,
		},
	});

	// Update form values when settings are loaded from the theme context
	useEffect(() => {
		if (settings) {
			form.reset({
				primaryColor: settings.primaryColor,
				logoUrl: settings.logoUrl,
				logoWidth: settings.logoWidth,
				logoHeight: settings.logoHeight,
				logoAlt: settings.logoAlt,
				background: settings.background,
				foreground: settings.foreground,
				card: settings.card,
				cardForeground: settings.cardForeground,
				secondary: settings.secondary,
				accent: settings.accent,
				destructive: settings.destructive,
				border: settings.border,
				input: settings.input,
				radius: settings.radius,
				primaryForeground: settings.primaryForeground,
			});
		}
	}, [settings, form]);

	const onSubmit = async (values: SettingsFormValues) => {
		let newLogoUrl = values.logoUrl;

		if (logoFile) {
			const formData = new FormData();
			formData.append("file", logoFile);

			try {
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				const result = await response.json();

				if (result.success) {
					newLogoUrl = result.url;
				} else {
					console.error("Logo upload failed:", result.message);
				}
			} catch (error) {
				console.error("Error uploading logo:", error);
			}
		}

		updateSettings({
			...values,
			logoUrl: newLogoUrl,
		});
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className='p-6 max-w-7xl mx-auto'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<h1 className='text-2xl font-bold'>Customization Settings</h1>

					<SettingsSection title='Logo'>
						<FormField
							control={form.control}
							name='logoUrl'
							render={({ field }) => (
								<FormItem className='md:col-span-2'>
									<FormLabel>Company Logo</FormLabel>
									<FormControl>
										<Input
											type='file'
											accept='.png, .jpg, .jpeg, .svg'
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													setLogoFile(file);
													setLogoPreview(URL.createObjectURL(file));
												}
											}}
										/>
									</FormControl>
									<div className='mt-4'>
										<p className='text-sm text-muted-foreground'>
											Logo Preview:
										</p>
										{logoPreview || field.value ? (
											<Image
												src={logoPreview || field.value || ""}
												alt={form.watch("logoAlt") || "Logo Preview"}
												width={form.watch("logoWidth") || 100}
												height={form.watch("logoHeight") || 40}
												className='mt-2 rounded-md object-contain'
												style={{
													width: `${form.watch("logoWidth") || 100}px`,
													height: `${form.watch("logoHeight") || 40}px`,
												}}
											/>
										) : (
											<div className='mt-2 flex h-10 w-[100px] items-center justify-center rounded-md border border-dashed bg-muted'>
												<span className='text-xs text-muted-foreground'>
													No logo
												</span>
											</div>
										)}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='logoAlt'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Logo Alt Text</FormLabel>
									<FormControl>
										<Input type='text' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='logoWidth'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Logo Width (px)</FormLabel>
									<FormControl>
										<Input type='number' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='logoHeight'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Logo Height (px)</FormLabel>
									<FormControl>
										<Input type='number' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</SettingsSection>

					<SettingsSection title='Core Colors'>
						<ColorInput
							name='primaryColor'
							label='Primary'
							control={form.control}
						/>
						<ColorInput
							name='primaryForeground'
							label='Primary Foreground'
							control={form.control}
						/>
						<ColorInput
							name='background'
							label='Background'
							control={form.control}
						/>
						<ColorInput
							name='foreground'
							label='Foreground'
							control={form.control}
						/>
						<ColorInput name='card' label='Card' control={form.control} />
						<ColorInput
							name='cardForeground'
							label='Card Foreground'
							control={form.control}
						/>
					</SettingsSection>

					<SettingsSection title='Accent Colors'>
						<ColorInput
							name='secondary'
							label='Secondary'
							control={form.control}
						/>
						<ColorInput name='accent' label='Accent' control={form.control} />
						<ColorInput
							name='destructive'
							label='Destructive'
							control={form.control}
						/>
					</SettingsSection>

					<SettingsSection title='UI Elements'>
						<ColorInput name='border' label='Border' control={form.control} />
						<ColorInput name='input' label='Input' control={form.control} />
						<FormField
							control={form.control}
							name='radius'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Border Radius</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder='e.g., 0.5rem'
											onChange={(e) => {
												field.onChange(e.target.value);
												setSettings({ ...settings, radius: e.target.value });
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</SettingsSection>

					<Button type='submit' disabled={isPending}>
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</form>
			</Form>
		</div>
	);
}
