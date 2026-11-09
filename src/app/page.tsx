import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const pilotBrands = [
    { name: "Uniqlo India", status: "Data pending" },
    { name: "H&M India", status: "Data pending" },
    { name: "Zara India", status: "Data pending" },
    { name: "Levi's India", status: "Data pending" },
    { name: "Van Heusen", status: "Data pending" },
    { name: "Westside", status: "Data pending" },
    { name: "Max Fashion", status: "Data pending" },
    { name: "Snitch", status: "Data pending" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Editorial Navigation */}
      <header className="border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-btn bg-accent text-white flex items-center justify-center font-display text-lg tracking-tight">
              W
            </span>
            <span className="font-semibold text-xl tracking-tight text-text-primary">
              Wear<span className="text-accent">Id</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/methodology"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block"
            >
              Methodology
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-btn bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors"
            >
              Build Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-badge bg-accent-subtle text-accent text-xs font-medium tracking-wide uppercase mb-6">
            Universal Clothing Identity · India-First
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-text-primary leading-tight tracking-tight mb-6">
            Your size, across every brand.
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
            Clothing sizes are notoriously inconsistent. Your fit profile shouldn&apos;t be.
            One sovereign profile calibrated to your actual measurements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 rounded-btn bg-accent text-white font-medium text-base hover:bg-accent-hover transition-all shadow-sm hover:shadow-md"
            >
              Build your profile — it&apos;s free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[48px] px-8 rounded-btn bg-bg-surface border border-border-strong text-text-primary font-medium text-base hover:bg-bg-elevated transition-colors"
            >
              See how it works
            </a>
          </div>
        </section>

        {/* The Problem: Comparison Diagram */}
        <section className="py-12 px-6 max-w-5xl mx-auto">
          <div className="rounded-card border border-border bg-bg-surface p-8 shadow-sm">
            <div className="text-center max-w-md mx-auto mb-10">
              <span className="text-xs uppercase tracking-wide text-text-secondary font-medium">
                The Reality of Apparel Sizing
              </span>
              <h2 className="text-2xl font-semibold text-text-primary mt-2">
                One Body. Four Different Sizes.
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { brand: "Brand A (Zara)", size: "L", note: "European master pattern" },
                { brand: "Brand B (H&M)", size: "M", note: "Standard commercial grade" },
                { brand: "Brand C (Westside)", size: "S", note: "Relaxed domestic vanity cut" },
                { brand: "Brand D (Snitch)", size: "XL", note: "Streetwear drop-shoulder" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-btn bg-bg-base border border-border flex flex-col items-center justify-center"
                >
                  <span className="text-xs text-text-secondary font-medium mb-1">
                    {item.brand}
                  </span>
                  <span className="font-display text-4xl text-text-primary my-2">
                    {item.size}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {item.note}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-text-secondary mt-6">
              WearId decouples body anatomy from arbitrary brand labels using deterministic ease modeling.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-text-primary tracking-tight">
              How WearId Works
            </h2>
            <p className="text-text-secondary mt-3">
              Mathematical precision in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent flex items-center justify-center font-semibold mb-5">
                1
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Measure Once
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Enter your measurements via tape, derive them from your best-fitting t-shirt, or use quick estimates.
              </p>
            </div>

            <div className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent flex items-center justify-center font-semibold mb-5">
                2
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Search Any Brand
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Search verified Indian & international apparel brands. We match against finished garment specs.
              </p>
            </div>

            <div className="rounded-card border border-border bg-bg-surface p-6 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent flex items-center justify-center font-semibold mb-5">
                3
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Get Explainable Fit
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                See your recommended size with an exact ease breakdown in centimeters, fabric stretch notes, and confidence scores.
              </p>
            </div>
          </div>
        </section>

        {/* Pilot Brands Strip */}
        <section className="py-12 border-t border-border bg-bg-surface">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs uppercase tracking-wider text-text-secondary font-medium mb-8">
              Phase 1 Pilot Research Targets (Men&apos;s T-Shirts)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {pilotBrands.map((b, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-btn border border-border bg-bg-base text-center flex flex-col items-center justify-center"
                >
                  <span className="font-medium text-sm text-text-primary">{b.name}</span>
                  <span className="text-2xs text-text-tertiary mt-0.5 font-medium">{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-base py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">WearId</span>
            <span>—</span>
            <span>One profile. Every brand. A better fit.</span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/methodology" className="hover:text-text-primary transition-colors">Methodology</Link>
            <Link href="/contribute" className="hover:text-text-primary transition-colors">Contribute Data</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
