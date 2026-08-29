import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { MetaPixelEvents } from '@/components/meta-pixel-events';
import { getMetaPixelBootstrapScript, isMetaPixelEnabled, META_PIXEL_ID } from '@/lib/meta-pixel';
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
        {isMetaPixelEnabled() ? (
          <>
            <Script id="meta-pixel-base" strategy="beforeInteractive">
              {getMetaPixelBootstrapScript(META_PIXEL_ID)}
            </Script>
            <noscript>
              <img
                alt=""
                height="1"
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                style={{ display: 'none' }}
                width="1"
              />
            </noscript>
            <Suspense fallback={null}>
              <MetaPixelEvents />
            </Suspense>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
