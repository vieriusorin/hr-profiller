"use client";

import { useFormContext } from "react-hook-form";
import { GanttColorInput } from "./gantt-color-input";
import { SettingsFormValues } from "../schema";

export const GanttSettings = () => {
	const { control } = useFormContext<SettingsFormValues>();

	return (
		<div className='space-y-6'>
			<h2 className='text-xl font-semibold mb-4'>Gantt Chart Colors</h2>
			<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
				<GanttColorInput
					name='gantt.todayColor'
					label='Today Marker Color'
					control={control}
				/>
				<GanttColorInput
					name='gantt.arrowColor'
					label='Arrow Color'
					control={control}
				/>
			</div>
			<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
				High Probability (70%+)
			</h3>
			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
				<GanttColorInput
					name='gantt.highProbability.backgroundColor'
					label='Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.highProbability.backgroundSelectedColor'
					label='Selected Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.highProbability.progressColor'
					label='Progress Bar'
					control={control}
				/>
				<GanttColorInput
					name='gantt.highProbability.progressSelectedColor'
					label='Selected Progress'
					control={control}
				/>
			</div>
			<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
				Medium Probability (30-70%)
			</h3>
			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
				<GanttColorInput
					name='gantt.mediumProbability.backgroundColor'
					label='Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.mediumProbability.backgroundSelectedColor'
					label='Selected Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.mediumProbability.progressColor'
					label='Progress Bar'
					control={control}
				/>
				<GanttColorInput
					name='gantt.mediumProbability.progressSelectedColor'
					label='Selected Progress'
					control={control}
				/>
			</div>
			<h3 className='text-lg font-semibold mb-4 border-t pt-4'>
				Low Probability (&lt;30%)
			</h3>
			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
				<GanttColorInput
					name='gantt.lowProbability.backgroundColor'
					label='Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.lowProbability.backgroundSelectedColor'
					label='Selected Background'
					control={control}
				/>
				<GanttColorInput
					name='gantt.lowProbability.progressColor'
					label='Progress Bar'
					control={control}
				/>
				<GanttColorInput
					name='gantt.lowProbability.progressSelectedColor'
					label='Selected Progress'
					control={control}
				/>
			</div>
			<h3 className='text-lg font-semibold mb-4 border-t pt-4'>Role Colors</h3>
			<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6'>
				<GanttColorInput
					name='gantt.role.progressColor'
					label='Progress Bar'
					control={control}
				/>
				<GanttColorInput
					name='gantt.role.progressSelectedColor'
					label='Selected Progress'
					control={control}
				/>
			</div>
		</div>
	);
};
