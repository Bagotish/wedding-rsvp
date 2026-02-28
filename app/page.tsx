import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

// 1. Konfigurasi Client
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. Server Action untuk Hantar RSVP
async function submitRSVP(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const attendance = formData.get('attendance') as string;
  const file = formData.get('image') as File;
  let imageUrl = '';

  // Upload Gambar ke Cloudinary jika ada fail
  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'wedding_rsvp', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
    imageUrl = (uploadResponse as any).secure_url;
  }

  // Simpan ke Supabase
  await supabase.from('guests').insert([
    {
      name,
      attendance,
      image_url: imageUrl,
    },
  ]);

  // Refresh page untuk paparkan data baru
  revalidatePath('/');
}

// 3. UI Halaman Utama
export default async function Home() {
  // Ambil data tetamu
  const { data: guests } = await supabase.from('guests').select('*').order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">RSVP Majlis Kahwin 💍</h1>

      {/* Borang RSVP */}
      <form action={submitRSVP} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-10">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nama Anda</label>
          <input type="text" name="name" required className="mt-1 block w-full border rounded-md p-2" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Kehadiran</label>
          <select name="attendance" className="mt-1 block w-full border rounded-md p-2">
            <option value="Hadir">Hadir</option>
            <option value="Tidak Hadir">Tidak Hadir</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Gambar (Optional)</label>
          // Bahagian Borang dalam app/page.tsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Ambil Gambar (Kamera)</label>
  <div className="mb-4">
  <label className="block text-sm font-medium text-gray-700">Ambil Gambar (Kamera)</label>
  <input 
    type="file" 
    name="image" 
    accept="image/*" 
    // Tukar kepada salah satu daripada ini:
    capture="environment" // Untuk kamera belakang (biasanya untuk gambar suasana)
    // capture="user"     // Untuk kamera depan (selfie)
    className="mt-1 block w-full" 
  />
</div>
</div>        
</div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Hantar RSVP
        </button>
      </form>

      {/* Senarai Tetamu */}
      <h2 className="text-2xl font-semibold text-center mb-6">Tetamu yang hadir ({guests?.length || 0})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guests?.map((guest) => (
          <div key={guest.id} className="bg-white p-4 rounded-lg shadow border text-center">
            {guest.image_url && (
              <Image
                src={guest.image_url}
                alt={guest.name}
                width={200}
                height={200}
                className="rounded-full mx-auto mb-3 h-32 w-32 object-cover"
              />
            )}
            <p className="font-bold text-lg">{guest.name}</p>
            <p className="text-sm text-gray-600">{guest.attendance}</p>
          </div>
        ))}
      </div>
    </main>
  );
}