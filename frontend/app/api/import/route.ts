import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import fs from "fs/promises";
import path from "path";

const dbPath = path.resolve(process.cwd(), "db.json");

interface DbData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opportunities: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  employees: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clients: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidates: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

async function readDb(): Promise<DbData> {
  const dbData = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(dbData);
}

async function writeDb(data: DbData) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const dataType = formData.get("dataType") as string;

    if (!file || !dataType) {
      return NextResponse.json({ message: "File and data type are required" }, { status: 400 });
    }

    const fileContent = await file.text();
    const { data: parsedData, meta } = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json({ message: "CSV file is empty or invalid." }, { status: 400 });
    }

    const db = await readDb();

    if (!db[dataType]) {
      db[dataType] = [];
    }

    // Simple validation for employees
    if (dataType === 'employees') {
      const requiredFields = ['id', 'name', 'email', 'position', 'department', 'employeeStatus', 'workStatus', 'hireDate', 'jobGrade', 'location'];
      const headers = meta.fields;
      if (!headers) {
        return NextResponse.json({ message: "Could not parse headers from CSV." }, { status: 400 });
      }
      const missingHeaders = requiredFields.filter(field => !headers.includes(field));
      if (missingHeaders.length > 0) {
        return NextResponse.json({ message: `Missing required headers: ${missingHeaders.join(', ')}` }, { status: 400 });
      }
    }


    db[dataType] = [...db[dataType], ...parsedData];
    await writeDb(db);

    return NextResponse.json({ message: `${parsedData.length} records imported successfully to ${dataType}.` });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ message: "An error occurred during import." }, { status: 500 });
  }
} 