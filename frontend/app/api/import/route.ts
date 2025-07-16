import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";

// Helper function to split full name into first and last name
function splitName(fullName: string): { firstName: string; lastName: string } {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
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

    // Simple validation for employees
    if (dataType === 'employees') {
      const requiredFields = ['name', 'email', 'position', 'department', 'workStatus', 'jobGrade'];
      const headers = meta.fields;
      if (!headers) {
        return NextResponse.json({ message: "Could not parse headers from CSV." }, { status: 400 });
      }
      const missingHeaders = requiredFields.filter(field => !headers.includes(field));
      if (missingHeaders.length > 0) {
        return NextResponse.json({ message: `Missing required headers: ${missingHeaders.join(', ')}` }, { status: 400 });
      }

      // Transform and send data to backend
      const successfulImports: any[] = [];
      const failedImports: any[] = [];

      for (const row of parsedData as any[]) {
        try {
          const { firstName, lastName } = splitName(row.name || '');
          
          // Transform each row for the backend API
          const transformedEmployee = {
            person: {
              firstName,
              lastName,
              fullName: row.name,
              email: row.email
            },
            employment: {
              position: row.position,
              location: row.department, // Map department to location
              jobGrade: row.jobGrade,
              workStatus: row.workStatus || 'Available',
              employeeStatus: 'Active',
              hireDate: new Date().toISOString().split('T')[0] // Current date as YYYY-MM-DD
            }
          };

          // Make POST request to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/employees`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(transformedEmployee),
          });

          if (response.ok) {
            const result = await response.json();
            successfulImports.push({ name: row.name, id: result.data?.id });
          } else {
            const error = await response.json();
            failedImports.push({ 
              name: row.name, 
              error: error.message || `HTTP ${response.status}` 
            });
          }
        } catch (error) {
          failedImports.push({ 
            name: row.name, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      // Return summary of import results
      const totalRecords = parsedData.length;
      const successCount = successfulImports.length;
      const failCount = failedImports.length;

      return NextResponse.json({
        message: `Import completed: ${successCount}/${totalRecords} employees imported successfully.`,
        summary: {
          total: totalRecords,
          successful: successCount,
          failed: failCount,
          successfulImports: successfulImports.slice(0, 5), // Show first 5 successful
          failedImports: failedImports.slice(0, 5), // Show first 5 failed
        }
      });
    }

    // For other data types (non-employees), return error as we only support employees now
    return NextResponse.json({ message: "Only employee imports are currently supported." }, { status: 400 });

  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ 
      message: "An error occurred during import.", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 