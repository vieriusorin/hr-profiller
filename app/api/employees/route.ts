import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

async function readDb() {
  const dbData = await fs.readFile(dbPath, 'utf-8');
  return JSON.parse(dbData);
}

export async function GET() {
  try {
    const db = await readDb();
    return NextResponse.json(db.employees);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching employees' }, { status: 500 });
  }
} 