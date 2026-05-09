import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = 'https://og-model-dashboard.vercel.app';
const TITLE = 'PolicyEngine Macro · OG-UK Dashboard';
const DESCRIPTION =
  'Static dashboard explaining OG-UK, the UK calibration of OG-Core. Showcases an overlapping-generations macro model with a worked UK reform, methodology, and OBR comparison.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: 'PolicyEngine' }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'PolicyEngine',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    site: '@ThePolicyEngine',
  },
};

export const viewport: Viewport = {
  themeColor: '#2C6496',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
          crossOrigin="anonymous"
        />
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
          crossOrigin="anonymous"
        />
        <script src="https://cdn.plot.ly/plotly-2.35.2.min.js" charSet="utf-8" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
