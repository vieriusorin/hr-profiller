"use client";

import { useFormContext } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { SettingsFormValues } from "../schema";
import { GeneralSettingsProps } from "../types";

export const GeneralSettings = ({
	logoPreview,
	handleLogoChange,
}: GeneralSettingsProps) => {
	const form = useFormContext<SettingsFormValues>();

	return (
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
									onChange={handleLogoChange}
								/>
							</FormControl>
							<div className='mt-4'>
								<p className='text-sm text-muted-foreground'>Logo Preview:</p>
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
	);
};
