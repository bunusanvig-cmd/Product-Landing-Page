import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: `${siteConfig.brandName} | Pure Mustard Oil COD Funnel`,
  description:
    'A premium cash on delivery funnel for Pure Mustard Oil with landing page, checkout, thank-you page, Sheets sync, and email notifications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-[family-name:var(--font-body)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
