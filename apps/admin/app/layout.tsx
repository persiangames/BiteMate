import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AdminAuthProvider } from '@/lib/auth';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BiteMate Admin',
  description: 'BiteMate platform admin dashboard',
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/brand/icon-180.png', sizes: '180x180' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
