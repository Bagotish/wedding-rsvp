// app/api/cloudinary-usage/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  // Create Basic Auth Header
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/usage`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
        },
        next: { revalidate: 60 } // Cache data untuk 1 minit supaya tak spam Cloudinary API
      }
    );

    const data = await response.json();
    
    // Cloudinary return data dalam bytes, jom tukar ke MB/GB
    return NextResponse.json({
      storage: {
        used: (data.storage.used / (1024 * 1024)).toFixed(2), // MB
        limit: (data.storage.limit / (1024 * 1024)).toFixed(2), // MB
        percent: data.storage.used_percent
      },
      bandwidth: {
        used: (data.bandwidth.used / (1024 * 1024)).toFixed(2), // MB
        percent: data.bandwidth.used_percent
      },
      credits: data.credits.used_percent // Total Credits Usage
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}