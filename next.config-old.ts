/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan bahagian ini
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Konfigurasi serverActions yang kita buat tadi (jika belum ada)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

module.exports = nextConfig;