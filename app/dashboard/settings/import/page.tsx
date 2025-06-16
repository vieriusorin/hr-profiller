"use client";

import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useImportPage } from "./hooks/use-import-page";

const DATA_TYPES = ["employees", "clients", "projects", "candidates"];

export default function ImportPage() {
	const {
		file,
		dataType,
		setDataType,
		handleFileChange,
		handleSubmit,
		isPending,
	} = useImportPage();

	return (
		<div className='p-6 max-w-7xl mx-auto w-full'>
			<PageHeader>
				<PageHeaderHeading>Import Data</PageHeaderHeading>
			</PageHeader>
			<Card>
				<CardHeader>
					<CardTitle>CSV Import</CardTitle>
					<CardDescription>
						Select a data type and a CSV file to import. Ensure the CSV format
						matches the required structure.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='dataType'>Data Type</Label>
							<div className='flex items-center gap-2'>
								<Select onValueChange={setDataType} value={dataType}>
									<SelectTrigger>
										<SelectValue placeholder='Select data type...' />
									</SelectTrigger>
									<SelectContent>
										{DATA_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
												{type.charAt(0).toUpperCase() + type.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									type='button'
									variant='outline'
									disabled={!dataType}
									onClick={() => window.open(`/samples/${dataType}.csv`)}
								>
									Download Sample
								</Button>
							</div>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='file'>CSV File</Label>
							<Input
								id='file'
								type='file'
								accept='.csv'
								onChange={handleFileChange}
							/>
						</div>
						<Button type='submit' disabled={!file || !dataType || isPending}>
							{isPending ? "Importing..." : "Import Data"}
						</Button>
					</form>
					<div className='mt-6'>
						<h3 className='font-semibold'>CSV Format Instructions</h3>
						<p className='text-sm text-muted-foreground'>
							Select a data type to download a sample CSV with the required
							headers.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
