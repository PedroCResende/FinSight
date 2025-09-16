import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'FinSight',
  description: 'Seu Rastreador Financeiro Pessoal e Inteligente',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A7D9A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 21h4c4.4 0 8-3.6 8-8V7a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v6c0 4.4 3.6 8 8 8Z'/%3E%3Cpath d='M16 9h.01'/%3E%3Cpath d='M2 13.6c0 1.6 1.3 2.9 2.9 2.9h14.2c1.6 0 2.9-1.3 2.9-2.9v-2.1'/%3E%3C/svg%3E" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
