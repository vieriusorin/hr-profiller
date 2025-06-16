"use client";
import { useMemo, useState } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Opportunity } from "@/shared/schemas/api-schemas";
import { format } from "date-fns";
import { useTheme } from "@/app/providers/theme-provider";
import type { GanttSettings } from "@/app/providers/theme-provider";

interface GanttChartProps {
	opportunities: Opportunity[];
}

const getStylesForProbability = (
	probability: number,
	ganttSettings: GanttSettings | undefined
) => {
	if (!ganttSettings) return {};

	if (probability > 70) {
		return ganttSettings.highProbability;
	}
	if (probability > 30) {
		return ganttSettings.mediumProbability;
	}
	return ganttSettings.lowProbability;
};

interface TaskNew extends Task {
	status?: string;
}

const transformDataForGantt = (
	opportunities: Opportunity[],
	expandedTasks: { [key: string]: boolean },
	ganttSettings: GanttSettings | undefined
): TaskNew[] => {
	if (!opportunities) return [];

	const tasks: TaskNew[] = [];
	opportunities.forEach((opp) => {
		const startDate = new Date(opp.expectedStartDate);
		const endDate = new Date(startDate);
		endDate.setMonth(startDate.getMonth() + 2);

		tasks.push({
			start: startDate,
			end: endDate,
			name: opp.clientName + " - " + opp.opportunityName,
			id: opp.id,
			type: "project",
			status: opp.status,
			progress: opp.probability,
			isDisabled: false,
			styles: getStylesForProbability(opp.probability, ganttSettings),
			hideChildren: expandedTasks[opp.id] === false,
		});

		opp.roles.forEach((role) => {
			const roleStartDate = new Date(opp.expectedStartDate);
			const roleEndDate = new Date(roleStartDate);
			roleEndDate.setMonth(roleStartDate.getMonth() + 1);

			tasks.push({
				start: roleStartDate,
				end: roleEndDate,
				name: role.roleName,
				id: `${opp.id}-${role.id}`,
				type: "project",
				status: opp.status,
				progress: role.status === "Won" || role.status === "Staffed" ? 100 : 0,
				isDisabled: false,
				project: opp.id,
				styles: {
					progressColor: ganttSettings?.role?.progressColor,
					progressSelectedColor: ganttSettings?.role?.progressSelectedColor,
				},
			});
		});
	});

	return tasks;
};

export const GanttChart = ({ opportunities }: GanttChartProps) => {
	const { settings } = useTheme();
	const [expandedTasks, setExpandedTasks] = useState<{
		[key: string]: boolean;
	}>({});

	const handleExpanderClick = (task: Task) => {
		if (task.type === "project") {
			setExpandedTasks((prev) => ({
				...prev,
				[task.id]: !(prev[task.id] ?? true),
			}));
		}
	};
	const tasks = useMemo(
		() => transformDataForGantt(opportunities, expandedTasks, settings.gantt),
		[opportunities, expandedTasks, settings.gantt]
	);

	return (
		<div>
			{tasks.length > 0 ? (
				<Gantt
					fontFamily='Outfit'
					tasks={tasks}
					viewMode={ViewMode.Month}
					columnWidth={135}
					onExpanderClick={handleExpanderClick}
					todayColor={settings.gantt?.todayColor}
					arrowColor={settings.gantt?.arrowColor}
					arrowIndent={10}
					barCornerRadius={3}
					barFill={80}
					headerHeight={70}
					rowHeight={50}
					locale='en'
					TooltipContent={({ task }) => (
						<div className='bg-white p-2 rounded-md shadow-md'>
							<p className='text-sm font-medium'>{task.name}</p>
							<p className='text-xs text-gray-500'>
								<span className='text-gray-500 font-bold'>Probability:</span>{" "}
								{task.progress}%
							</p>
							<p className='text-xs text-gray-500'>
								<span className='text-gray-500 font-bold'>Start:</span>{" "}
								{format(task.start, "MM/dd/yyyy")}
							</p>
							<p className='text-xs text-gray-500'>
								<span className='text-gray-500 font-bold'>End:</span>{" "}
								{format(task.end, "MM/dd/yyyy")}
							</p>
							<p className='text-xs text-gray-500'>
								<span className='text-gray-500 font-bold'>Status:</span>{" "}
								{(task as TaskNew).status}
							</p>
						</div>
					)}
				/>
			) : (
				<p>Loading or no data available to display.</p>
			)}
		</div>
	);
};
