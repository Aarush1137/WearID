"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Footprints,
  Layers,
  Sparkles,
  Scale,
  Smartphone,
  Lock,
  Play,
  Scissors,
  Heart,
  Store,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { PILOT_BRANDS } from "@/core/data/pilotBrands";
import { useAuthStore } from "@/lib/auth/authStore";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-bg-base text-text-primary">
      {/* Editorial Navigation */}
      <header className="border-b border-border bg-bg-surface/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg tracking-tight group-hover:bg-accent-hover transition-colors shadow-xs">
              W
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-xl tracking-tight text-text-primary leading-none">
                Wear<span className="text-accent">ID</span>
              </span>
              <span className="text-[10px] text-text-secondary tracking-wide uppercase font-medium mt-0.5 hidden sm:inline-block">
                Sovereign Clothing Identity
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/app/compare"
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors hidden md:inline-flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5 text-accent" />
              <span>Cross-Brand Compare</span>
            </Link>
            <Link
              href="/app/explore"
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5 text-accent" />
              <span>Brand Catalog (28)</span>
            </Link>

            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-btn bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-xs"
              >
                <span>Open Size Passport</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-btn bg-bg-surface border border-border text-text-primary font-semibold text-xs hover:bg-bg-elevated transition-colors"
                >
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-btn bg-accent text-white font-semibold text-xs hover:bg-accent-hover transition-all shadow-xs"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          {/* Status Badges */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-badge bg-accent-subtle text-accent text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Clothing Identity · Sovereign Fit Standard</span>
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
            Your exact size across every brand. <br className="hidden sm:inline" />
            <span className="text-accent italic font-normal">Deterministic. Private. Zero guess.</span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
            Apparel sizing is notoriously fragmented: you might be a Medium in H&M, a Large in Zara, and a 32 in Levi&apos;s.
            WearID decouples human anatomy from vanity labels using deterministic millimeter-precision ease modeling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link
              href={isAuthenticated ? "/app" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 rounded-btn bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-all shadow-sm hover:shadow-md"
            >
              <span>{isAuthenticated ? "Go to My Size Passport" : "Claim Your Free Passport"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/app/compare?tab=footwear"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-6 rounded-btn bg-bg-surface border border-border-strong text-text-primary font-semibold text-sm hover:bg-bg-elevated transition-colors"
            >
              <Footprints className="w-4 h-4 mr-2 text-accent" />
              <span>Shoe Size Comparator</span>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-accent" />
              Client-side AES-256 Encryption
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Strict Provenance Protocols
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-accent" />
              Mobile Phone OTP / Google
            </span>
          </div>
        </section>

        {/* Official Product Launch Video Showcase */}
        <section className="py-8 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-card border-2 border-border-strong bg-bg-surface p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-accent" />
                  Official Product Launch Video
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-text-primary mt-0.5">
                  Watch WearID in Action (15s Overview)
                </h2>
              </div>
              <span className="text-[11px] text-text-tertiary">
                Direct In-Browser Playback · Sound Enabled
              </span>
            </div>

            <div className="relative rounded-btn overflow-hidden bg-black/90 aspect-video max-h-[440px] flex items-center justify-center">
              <video
                src="/media/brag.mp4"
                poster="/media/brag.jpg"
                controls
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain rounded-btn"
              >
                <source src="/media/brag.mp4" type="video/mp4" />
                <source src="https://github.com/Aarush1137/WearID/raw/main/brag-output/brag.mp4" type="video/mp4" />
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
            <p className="text-xs text-text-secondary mt-3 text-center">
              Demonstrating universal biometric passport portability, 3D intimate apparel draping, and deterministic multi-system shoe conversion.
            </p>
          </div>
        </section>

        {/* Feature Grid: 4 Pillars of WearID */}
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Core Sizing Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mt-1">
              Engineering the Death of Vanity Sizing
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-2">
              Every clothing dimension stored in canonical millimeters (<code className="text-accent font-mono font-bold">mm</code>). Zero synthetic size charts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1: Footwear & Shoe Matrix */}
            <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-btn bg-accent-subtle text-accent flex items-center justify-center mb-3">
                  <Footprints className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-text-primary">
                  Shoe Size Equivalence
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  Full UK, US, EU, CM, and IN conversion across Men, Women, and Kids. Explains brand divergence like why 27.0cm is UK 8 in Nike but UK 8.5 in Adidas.
                </p>
              </div>
              <Link
                href="/app/compare?tab=footwear"
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-accent inline-flex items-center gap-1 hover:underline"
              >
                <span>Try Shoe Comparator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: Intimate Apparel & Bras */}
            <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-btn bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-text-primary">
                  Couture Intimates & Bras
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  3D Cup Volume projection scaling, underwire curvature matching, underband ribcage tension analysis, and sister-size cross-conversion.
                </p>
              </div>
              <Link
                href="/app/explore"
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-rose-600 inline-flex items-center gap-1 hover:underline"
              >
                <span>Browse Intimates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Digital Tailor Card & QR */}
            <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-btn bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center mb-3">
                  <Scissors className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-text-primary">
                  Master Tailor Card & QR
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  Instant QR code and WhatsApp share sheet for bespoke Indian suit makers, master darzis, and custom wedding couture without data leakage.
                </p>
              </div>
              <Link
                href="/app/tailor"
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline"
              >
                <span>Open Tailor Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4: Sovereign Biometric Privacy */}
            <div className="rounded-card border border-border bg-bg-surface p-5 shadow-xs flex flex-col justify-between hover:border-accent/40 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-btn bg-amber-50 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-text-primary">
                  Sovereign Biometric Privacy
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  Client-side AES-256-GCM encryption. Zero anatomical biometrics shared with retailers without your explicit, time-bound consent.
                </p>
              </div>
              <Link
                href="/privacy"
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-amber-700 inline-flex items-center gap-1 hover:underline"
              >
                <span>Read Privacy Charter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* The Reality: Why One Body Equals 4 Sizes */}
        <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-card border border-border bg-bg-surface p-6 sm:p-8 shadow-sm">
            <div className="text-center max-w-md mx-auto mb-8">
              <span className="text-xs uppercase tracking-wide text-accent font-semibold">
                The Reality of Apparel Sizing
              </span>
              <h2 className="text-2xl font-bold text-text-primary mt-1">
                One Body. Four Completely Different Sizes.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { brand: "Zara India", size: "L", note: "European tailored master cut" },
                { brand: "H&M India", size: "M", note: "Commercial international grade" },
                { brand: "Westside", size: "S", note: "Domestic vanity relaxed ease" },
                { brand: "Snitch", size: "XL", note: "Streetwear drop-shoulder cut" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-btn bg-bg-base border border-border flex flex-col items-center justify-center"
                >
                  <span className="text-xs text-text-secondary font-semibold mb-1">
                    {item.brand}
                  </span>
                  <span className="font-display text-4xl text-text-primary my-1 font-bold">
                    {item.size}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {item.note}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-text-secondary mt-6 max-w-xl mx-auto">
              WearID ends the return rate epidemic by matching your actual torso measurements directly against the manufacturer&apos;s physical laid-flat pattern dimensions.
            </p>
          </div>
        </section>

        {/* Verified Brand Registry: All 28 Brands */}
        <section className="py-16 border-t border-border bg-bg-surface">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge bg-accent-subtle text-accent text-xs font-semibold uppercase mb-1">
                  <Layers className="w-3 h-3" />
                  <span>28 Verified Partner Brands</span>
                </div>
                <h2 className="font-bold text-xl sm:text-2xl text-text-primary">
                  Official Size Guides & Provenance Audited
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Ingested under strict verification protocols. Zero hallucinated grading rules.
                </p>
              </div>

              <Link
                href="/app/explore"
                className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Full Product Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {PILOT_BRANDS.map((b) => (
                <Link
                  key={b.id}
                  href={`/app/explore`}
                  className="p-3 rounded-card border border-border bg-bg-base hover:bg-bg-elevated hover:border-accent/40 text-center flex flex-col items-center justify-center min-h-[68px] transition-all group"
                >
                  <span className="font-semibold text-xs text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                    {b.name}
                  </span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-badge mt-1 uppercase font-semibold">
                    Verified
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions: Clothing Size Comparison & Fit Check SEO */}
        <section className="py-16 border-t border-border bg-bg-base" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge bg-accent-subtle text-accent text-xs font-semibold uppercase mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </div>
              <h2 className="font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                Clothing Size Comparisons & Digital Fit Check
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-xl mx-auto">
                Everything you need to know about comparing sizes across brands and finding your perfect fit without guesswork.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does clothing size comparison work across different brands?",
                  a: "Every clothing brand grades their garments differently—a Medium in Zara may measure 520mm chest laid flat, while a Medium in Uniqlo measures 560mm. WearID eliminates size confusion through deterministic millimeter-level comparison between your actual body measurements and physical laid-flat pattern dimensions from 28+ verified brand databases.",
                },
                {
                  q: "What is a digital fit check and how does WearID perform it?",
                  a: "A digital fit check calculates the precise wearing ease (the difference between your body circumference and garment dimensions laid flat) across chest, shoulders, waist, and hips. WearID evaluates your anatomical profile against brand grading tables and explains whether an item will fit tight, true to size, or relaxed before you place an order.",
                },
                {
                  q: "Why do cloth size comparisons vary so much between brands like Zara, H&M, and Uniqlo?",
                  a: "Brands cut garments using different regional target demographics (European slim cut vs US/Asian relaxed fit) and fabric stretch tolerances. A size 'Large' is not a universal metric. WearID standardizes all sizing into canonical millimeters (mm) with verified manufacturer provenance.",
                },
                {
                  q: "Is my personal body measurement data kept private and secure?",
                  a: "Yes. In accordance with WearID's strict privacy invariants, all anatomical measurements are stored locally on your device and private by default. When sharing sizing with third-party retailers, WearID generates cryptographic fit tokens (e.g. 'Size L fits best (96% fit confidence)') without ever disclosing raw biometric numbers.",
                },
                {
                  q: "Which apparel and footwear brands can I compare on WearID?",
                  a: "WearID supports 28+ audited apparel and footwear brands including Zara, H&M, Uniqlo, Levi's, Snitch, Westside, Marks & Spencer, Nike, Adidas, Puma, and New Balance with verified garment dimensions and grading rules.",
                },
              ].map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-card border border-border bg-bg-surface p-4 sm:p-5 transition-colors open:border-accent/40 open:bg-bg-surface"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none text-sm sm:text-base font-semibold text-text-primary gap-4">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-text-tertiary transition-transform duration-200 group-open:rotate-180 flex-shrink-0" />
                  </summary>
                  <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed pt-2 border-t border-border/50">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-base py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-btn bg-accent text-white flex items-center justify-center font-display text-xs">
              W
            </span>
            <span className="font-bold text-text-primary">WearID</span>
            <span>—</span>
            <span>Your universal clothing identity, everywhere.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Charter</Link>
            <Link href="/methodology" className="hover:text-text-primary transition-colors">Measurement Methodology</Link>
            <Link href="/login" className="hover:text-text-primary transition-colors">Member Sign In</Link>
            <Link href="/app/compare" className="hover:text-text-primary transition-colors">Footwear Matrix</Link>
            <Link href="/app/explore" className="hover:text-text-primary transition-colors">Brand Catalog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
