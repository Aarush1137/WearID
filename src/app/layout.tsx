import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wear-id.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WearID — Universal Clothing Identity & Deterministic Fitting",
    template: "%s | WearID",
  },
  description:
    "Universal clothing identity, deterministic body-to-garment fitting, shoe size cross-brand equivalence, and sovereign measurement portability.",
  applicationName: "WearID",
  authors: [{ name: "WearID Engineering Team", url: siteUrl }],
  creator: "WearID",
  publisher: "WearID",
  keywords: [
    "clothing size",
    "size recommendation",
    "shoe size comparison",
    "bra size calculator",
    "body measurement app",
    "sizing passport",
    "fit engine",
    "tailor measurements",
    "Uniqlo sizes",
    "Zara sizes",
    "Nike shoe sizes",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WearID",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "WearID",
    title: "WearID — Universal Clothing Identity & Deterministic Fitting",
    description:
      "One sovereign sizing profile calibrated to your actual measurements. Deterministic fit matching across 28+ verified apparel and footwear brands.",
    images: [
      {
        url: `${siteUrl}/media/brag.jpg`,
        width: 1280,
        height: 720,
        alt: "WearID Universal Clothing Identity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WearID — Universal Clothing Identity & Deterministic Fitting",
    description:
      "Deterministic fit matching across 28+ verified apparel and footwear brands. Private by default.",
    images: [`${siteUrl}/media/brag.jpg`],
    creator: "@wearid",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google_verification_placeholder_wearid",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#425B48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmSerifDisplay.variable}`}>
      {/* Anti-flash script: apply saved theme before first paint */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('wearid-theme');if(t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-bg-base text-text-primary flex flex-col">
        <GoogleAnalytics />
        <ServiceWorkerRegister />
        <OfflineBanner />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <InstallPrompt />
      </body>
    </html>
  );
}
