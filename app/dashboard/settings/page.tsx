"use client";

import { useMemo, useEffect, useState } from "react";
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

type GanttFieldNames =
	| "gantt.todayColor"
	| "gantt.arrowColor"
	| "gantt.highProbability.backgroundColor"
	| "gantt.highProbability.backgroundSelectedColor"
	| "gantt.highProbability.progressColor"
	| "gantt.highProbability.progressSelectedColor"
	| "gantt.mediumProbability.backgroundColor"
	| "gantt.mediumProbability.backgroundSelectedColor"
	| "gantt.mediumProbability.progressColor"
	| "gantt.mediumProbability.progressSelectedColor"
	| "gantt.lowProbability.backgroundColor"
	| "gantt.lowProbability.backgroundSelectedColor"
	| "gantt.lowProbability.progressColor"
	| "gantt.lowProbability.progressSelectedColor"
	| "gantt.role.progressColor"
	| "gantt.role.progressSelectedColor";

const GanttColorInput: React.FC<{
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

export default function SettingsPage() {
	const { settings, isLoading } = useTheme();
	const mutation = useUpdateSettingsMutation();
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [activeTab, setActiveTab] = useState("general");

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
			gantt: settings.gantt,
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
				gantt: settings.gantt,
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

		mutation.mutate({
			...values,
			logoUrl: newLogoUrl,
		});
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className='p-6 max-w-7xl mx-auto w-full'>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<h1 className='text-2xl font-bold'>Customization Settings</h1>

					<div className='flex items-center justify-between mb-8'>
						<div className='flex gap-2 p-1 bg-muted rounded-lg'>
							<Button
								type='button'
								variant={activeTab === "general" ? "default" : "ghost"}
								onClick={() => setActiveTab("general")}
							>
								General
							</Button>
							<Button
								type='button'
								variant={activeTab === "theme" ? "default" : "ghost"}
								onClick={() => setActiveTab("theme")}
							>
								Theme
							</Button>
							<Button
								type='button'
								variant={activeTab === "gantt" ? "default" : "ghost"}
								onClick={() => setActiveTab("gantt")}
							>
								Gantt Chart
							</Button>
						</div>
						<Button type='submit' disabled={mutation.isPending}>
							{mutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>

					<div>
						{activeTab === "general" && (
							<div>
								<h2 className='text-xl font-semibold mb-4'>Logo</h2>
								<div className='space-y-6'>
									<FormField
										control={form.control}
										name='logoUrl'
										render={({ field }) => (
											<FormItem>
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
									<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
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
									</div>
								</div>
							</div>
						)}

						{activeTab === "theme" && (
							<div>
								<h2 className='text-xl font-semibold mb-4'>Theme Colors</h2>
								<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
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
								</div>
							</div>
						)}

						{activeTab === "gantt" && (
							<div className='space-y-6'>
								<h2 className='text-xl font-semibold mb-4'>
									Gantt Chart Colors
								</h2>
								<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
									<GanttColorInput
										name='gantt.todayColor'
										label='Today Marker Color'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.arrowColor'
										label='Arrow Color'
										control={form.control}
									/>
								</div>
								<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
									High Probability (70%+)
								</h3>
								<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
									<GanttColorInput
										name='gantt.highProbability.backgroundColor'
										label='Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.highProbability.backgroundSelectedColor'
										label='Selected Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.highProbability.progressColor'
										label='Progress Bar'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.highProbability.progressSelectedColor'
										label='Selected Progress'
										control={form.control}
									/>
								</div>
								<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
									Medium Probability (30-70%)
								</h3>
								<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
									<GanttColorInput
										name='gantt.mediumProbability.backgroundColor'
										label='Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.mediumProbability.backgroundSelectedColor'
										label='Selected Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.mediumProbability.progressColor'
										label='Progress Bar'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.mediumProbability.progressSelectedColor'
										label='Selected Progress'
										control={form.control}
									/>
								</div>
								<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
									Low Probability (&lt;30%)
								</h3>
								<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
									<GanttColorInput
										name='gantt.lowProbability.backgroundColor'
										label='Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.lowProbability.backgroundSelectedColor'
										label='Selected Background'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.lowProbability.progressColor'
										label='Progress Bar'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.lowProbability.progressSelectedColor'
										label='Selected Progress'
										control={form.control}
									/>
								</div>
								<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
									Role Colors
								</h3>
								<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
									<GanttColorInput
										name='gantt.role.progressColor'
										label='Progress Bar'
										control={form.control}
									/>
									<GanttColorInput
										name='gantt.role.progressSelectedColor'
										label='Selected Progress'
										control={form.control}
									/>
								</div>
							</div>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}
