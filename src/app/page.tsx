import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const partnerBrands = [
    { name: "Westside", status: "Layer 2 Graded" },
    { name: "FabIndia", status: "Layer 2 Graded" },
    { name: "Raymond", status: "Layer 2 & 3 Verified" },
    { name: "Snitch", status: "Layer 3 Flat Specs" },
    { name: "Roadster", status: "Contributor Verified" },
    { name: "H&M India", status: "Layer 2 Graded" },
    { name: "Marks & Spencer", status: "Layer 2 Graded" },
    { name: "Zara India", status: "Layer 2 Graded" },
    { name: "Uniqlo India", status: "Layer 3 Benchmark" },
    { name: "Levi's India", status: "Layer 2 & 3 Verified" },
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
              Wear<span className="text-accent">ID</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/app/explore"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block"
            >
              Catalog
            </Link>
            <Link
              href="/app/recommendations"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hidden sm:inline-block"
            >
              Recommendations
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-btn bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-colors"
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

        {/* Verified Brands Strip */}
        <section className="py-12 border-t border-border bg-bg-surface">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-secondary font-medium">
                  Verified Brand Registry & Benchmarks
                </p>
                <h3 className="font-semibold text-lg text-text-primary mt-0.5">
                  Verified Apparel Specifications
                </h3>
              </div>
              <Link
                href="/app/explore"
                className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1"
              >
                Explore Full Catalog
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {partnerBrands.map((b, i) => (
                <Link
                  key={i}
                  href="/app/recommend"
                  className="p-3.5 rounded-card border border-border bg-bg-base hover:bg-bg-elevated/70 hover:border-accent/40 text-center flex flex-col items-center justify-center min-h-[72px] transition-all group"
                >
                  <span className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors">{b.name}</span>
                  <span className="text-[11px] text-text-tertiary mt-1 font-medium">{b.status}</span>
                </Link>
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
