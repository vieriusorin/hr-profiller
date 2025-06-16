import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const extension = file.name.split('.').pop();
  const filename = `${uuidv4()}.${extension}`;

  // Define the path to save the file
  const dir = join(process.cwd(), 'public', 'uploads');
  const path = join(dir, filename);

  try {
    // Ensure the directory exists
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ success: false, message: 'File upload failed' }, { status: 500 });
  }
} 