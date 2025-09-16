'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>FinSight</title>
        <meta name="description" content="Seu Rastreador Financeiro Pessoal e Inteligente" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='none'/%3E%3Cpath d='M160,40H96A80,80,0,0,0,16,120v8a56,56,0,0,0,56,56h64a56,56,0,0,0,56-56v-8A80,80,0,0,0,160,40Z' fill='none' stroke='%235A7D9A' stroke-linecap='round' stroke-linejoin='round' stroke-width='16'/%3E%3Ccircle cx='188' cy='120' r='12' fill='%235A7D9A'/%3E%3C/svg%3E" type="image/svg+xml" />
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
