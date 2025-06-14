"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { toast } from "react-hot-toast";

const DATA_TYPES = ["employees", "clients", "projects", "candidates"];

export default function ImportPage() {
	const [file, setFile] = useState<File | null>(null);
	const [dataType, setDataType] = useState<string>("");

	const mutation = useMutation({
		mutationFn: async ({
			file,
			dataType,
		}: {
			file: File;
			dataType: string;
		}) => {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("dataType", dataType);

			const response = await fetch("/api/import", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Something went wrong");
			}

			return response.json();
		},
		onSuccess: (data) => {
			toast.success(data.message);
			setFile(null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!file || !dataType) {
			toast.error("Please select a file and a data type.");
			return;
		}
		mutation.mutate({ file, dataType });
	};

	return (
		<div className='p-6 max-w-7xl mx-auto'>
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
								onChange={(e) => setFile(e.target.files?.[0] || null)}
							/>
						</div>
						<Button
							type='submit'
							disabled={!file || !dataType || mutation.isPending}
						>
							{mutation.isPending ? "Importing..." : "Import Data"}
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
