import type { Metadata } from 'next';
import Providers from '@/components/shared/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Agri AI — AI-Powered Crop Disease Detection',
    template: '%s | Agri AI',
  },
  description:
    'Empower farmers with intelligent crop disease diagnosis. Real-time AI analysis validated by expert agronomists.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
