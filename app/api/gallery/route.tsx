// app/api/gallery/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const FOLDER_ID = '183ayHyrAXShpNmZU6qxN1HR9jaJvC5nN'; // Folder ID anda
  const API_KEY = process.env.GOOGLE_DRIVE_API_KEY; // Letak dalam .env

  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // Map data kepada format yang kita perlukan
    const photos = data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      // Format URL terus ke Google Drive Content
      image_url: `https://lh3.googleusercontent.com/d/${file.id}` 
    }));

    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}