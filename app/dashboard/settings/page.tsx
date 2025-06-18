"use client";

import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSettingsPage } from "./hooks/use-settings-page";
import { GeneralSettings } from "./components/general-settings";
import { ThemeSettings } from "./components/theme-settings";
import { GanttSettings } from "./components/gantt-settings";
import { withErrorBoundary } from '@/app/shared/components/with-error-boundary';

const SettingsPage = () => {
	const {
		form,
		isLoading,
		logoPreview,
		activeTab,
		setActiveTab,
		handleLogoChange,
		onSubmit,
		isPending,
	} = useSettingsPage();

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className='p-6 mx-auto w-full'>
			<FormProvider {...form}>
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
							<Button type='submit' disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>

						<div>
							{activeTab === "general" && (
								<GeneralSettings
									logoPreview={logoPreview}
									handleLogoChange={handleLogoChange}
								/>
							)}

							{activeTab === "theme" && <ThemeSettings />}

							{activeTab === "gantt" && <GanttSettings />}
						</div>
					</form>
				</Form>
			</FormProvider>
		</div>
	);
};

export default withErrorBoundary(SettingsPage);
