import { NextRequest, NextResponse } from 'next/server';
import { getWhiteLabelSettings, updateWhiteLabelSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getWhiteLabelSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings in API route:', error);
    return NextResponse.json({ message: 'Error reading settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updatedSettings = await updateWhiteLabelSettings(body);
    return NextResponse.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings in API route:', error);
    return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
  }
} 