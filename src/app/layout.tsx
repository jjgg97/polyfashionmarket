import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'PolyFashionMarket | The Global Fashion Prediction Exchange',
  description: 'Decentralized prediction markets for fashion trends, brands, and cultural movements. Built on Solana.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-bg text-[#FAF9F6] font-mono">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
