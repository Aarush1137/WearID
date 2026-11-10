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

const envUrl = process.env.NEXT_PUBLIC_APP_URL;
const siteUrl =
  envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") && envUrl.startsWith("http")
    ? envUrl.replace(/\/$/, "")
    : "https://wear-id.vercel.app";

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
    "WearID",
    "Wear ID",
    "wearid",
    "wear-id",
    "wear id app",
    "wearid clothing",
    "clothing size comparison",
    "cloth size comparisons",
    "cloth size comparison",
    "fit check",
    "clothing fit check",
    "size comparison",
    "find my clothing size across brands",
    "clothing size converter",
    "universal clothing identity",
    "deterministic fitting",
    "clothing size passport",
    "clothing size",
    "size recommendation",
    "shoe size comparison",
    "shoe size converter",
    "bra size calculator",
    "body measurement app",
    "sizing passport",
    "fit engine",
    "tailor measurements",
    "Uniqlo sizes",
    "Zara sizes",
    "Nike shoe sizes",
    "H&M sizes",
    "Levi's sizes",
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "dadc51ac5341a26f",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: "WearID",
                  alternateName: [
                    "Wear ID",
                    "wearid",
                    "wear-id",
                    "WearID App",
                    "WearID Clothing Identity",
                  ],
                  description:
                    "Universal clothing identity, deterministic body-to-garment fitting engine, and sovereign sizing passport.",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${siteUrl}/app/explore?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": `${siteUrl}/#application`,
                  name: "WearID",
                  applicationCategory: "LifestyleApplication",
                  operatingSystem: "All",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "WearID",
                  url: siteUrl,
                  logo: `${siteUrl}/icons/icon-512.png`,
                  sameAs: ["https://github.com/Aarush1137/WearID"],
                },
                {
                  "@type": "FAQPage",
                  "@id": `${siteUrl}/#faq`,
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "How does clothing size comparison work across different brands?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Every clothing brand grades their sizes differently—a Medium in Zara may measure 520mm chest laid flat, while a Medium in Uniqlo measures 560mm. WearID performs deterministic millimeter-level comparison between your actual body measurements and physical laid-flat pattern dimensions from 28+ verified brand databases, eliminating vanity sizing guesswork.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "What is a digital fit check and how does WearID do it?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "A digital fit check calculates the precise wearing ease (the difference between your body circumference and garment dimensions laid flat) across chest, shoulders, waist, and hips. WearID checks your anatomical profile against brand grading tables and explains whether an item will fit tight, true to size, or relaxed before you order.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Why do cloth size comparisons vary so much between brands?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Brands cut garments using different fit models, regional target demographics (European slim cut vs US relaxed fit), and fabric stretch allowances. WearID eliminates size ambiguity by converting all measurements to canonical millimeters (mm) with verified brand provenance.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is my body measurement data kept private?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. Following WearID's strict privacy invariants, body biometrics are stored locally on your device and private by default. When sharing sizing with third-party retailers, WearID issues cryptographic fit tokens (e.g., 'Size L fits best (96% fit confidence)') without ever revealing raw anatomical numbers.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Which brands can I compare on WearID?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "WearID supports 28+ audited apparel and footwear brands including Zara, H&M, Uniqlo, Levi's, Snitch, Westside, Marks & Spencer, Nike, Adidas, Puma, and New Balance with verified garment dimension provenance.",
                      },
                    },
                  ],
                },
              ],
            }),
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
