import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://wedding-album.vercel.app'),
  title: 'Nguyễn Thị Hồng',
  description: 'A cinematic luxury digital wedding album experience.',
  keywords: ['wedding', 'album', 'photography', 'luxury', 'digital wedding album'],
  openGraph: {
    title: 'Nguyễn Thị Hồng',
    description: 'A cinematic luxury digital wedding album experience.',
    type: 'website',
    images: ['/og-image.jpg']},
  twitter: {
    card: 'summary_large_image',
    title: 'Nguyễn Thị Hồng',
    description: 'A cinematic luxury digital wedding album experience.'},
  robots: { index: true, follow: true }};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505'};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning translate="no">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

