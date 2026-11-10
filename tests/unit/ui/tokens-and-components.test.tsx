import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "fs";
import path from "path";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  Badge,
  ConfidenceDot,
  getConfidenceLevel,
} from "@/components/ui";

describe("Design System Tokens (R2)", () => {
  const rootTokensPath = path.resolve(__dirname, "../../../styles/tokens.css");
  const srcTokensPath = path.resolve(__dirname, "../../../src/styles/tokens.css");

  it("canonical src/styles/tokens.css exists and defines tokens", () => {
    expect(fs.existsSync(srcTokensPath)).toBe(true);
    const srcContent = fs.readFileSync(srcTokensPath, "utf-8");
    expect(srcContent.length).toBeGreaterThan(500);
  });

  it("defines all required color, typography, surface, and semantic tokens", () => {
    const content = fs.readFileSync(srcTokensPath, "utf-8");

    // Surfaces
    expect(content).toContain("--bg-base:          #FAF8F5");
    expect(content).toContain("--bg-surface:       #FFFFFF");
    expect(content).toContain("--bg-elevated:      #F2EDE4");
    expect(content).toContain("--bg-accent-subtle: #E6EDF7");

    // Text
    expect(content).toContain("--text-primary:   #111622");
    expect(content).toContain("--text-secondary: #535D70");
    expect(content).toContain("--text-tertiary:  #8D96A5");
    expect(content).toContain("--text-on-accent: #FFFFFF");
    expect(content).toContain("--text-link:      #1B2A4A");

    // Accent (Savile Row Bespoke Navy)
    expect(content).toContain("--accent:         #1B2A4A");
    expect(content).toContain("--accent-hover:   #121D34");
    expect(content).toContain("--accent-active:  #0B1323");

    // Tailor's Camel / Brass
    expect(content).toContain("--terracotta:        #A47834");
    expect(content).toContain("--terracotta-hover:  #8C6325");
    expect(content).toContain("--terracotta-subtle: #FAF4EB");

    // Confidence
    expect(content).toContain("--confidence-high:   #1D5D42");
    expect(content).toContain("--confidence-medium: #9E5E10");
    expect(content).toContain("--confidence-low:    #A47834");
    expect(content).toContain("--confidence-none:   #535D70");

    // Typography
    expect(content).toContain("--font-sans:");
    expect(content).toContain("--font-display:");
    expect(content).toContain("--text-2xs:");
    expect(content).toContain("--text-6xl:");
    expect(content).toContain("--leading-tight:");
    expect(content).toContain("--tracking-wide:");
  });

  it("defines all required editorial component classes and safe-area utilities", () => {
    const content = fs.readFileSync(srcTokensPath, "utf-8");

    // Component classes
    expect(content).toContain(".card-editorial");
    expect(content).toContain(".btn-primary");
    expect(content).toContain(".btn-secondary");
    expect(content).toContain(".btn-ghost");
    expect(content).toContain(".btn-destructive");
    expect(content).toContain(".input-editorial");
    expect(content).toContain(".confidence-dot");
    expect(content).toContain(".confidence-dot-high");
    expect(content).toContain(".badge-pill");
    expect(content).toContain(".badge-pill-terracotta");

    // Safe area utilities
    expect(content).toContain(".pt-safe");
    expect(content).toContain(".pb-safe");
    expect(content).toContain(".safe-top");
    expect(content).toContain(".safe-bottom");
  });
});

describe("UI Component Primitives (R2)", () => {
  describe("Button Component", () => {
    it("renders primary variant with 44px min-height touch target", () => {
      render(<Button>Click Me</Button>);
      const btn = screen.getByRole("button", { name: /click me/i });
      expect(btn).toBeDefined();
      expect(btn.className).toContain("min-h-[44px]");
      expect(btn.className).toContain("bg-[var(--accent)]");
      expect(btn.className).toContain("rounded-[8px]");
    });

    it("supports secondary, ghost, and destructive variants", () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>);
      let btn = screen.getByRole("button", { name: /secondary/i });
      expect(btn.className).toContain("border-[var(--accent)]");

      rerender(<Button variant="ghost">Ghost</Button>);
      btn = screen.getByRole("button", { name: /ghost/i });
      expect(btn.className).toContain("bg-transparent");

      rerender(<Button variant="destructive">Delete</Button>);
      btn = screen.getByRole("button", { name: /delete/i });
      expect(btn.className).toContain("bg-[var(--destructive)]");
    });

    it("applies disabled styles correctly", () => {
      render(<Button disabled>Disabled Button</Button>);
      const btn = screen.getByRole("button", { name: /disabled button/i });
      expect(btn.hasAttribute("disabled")).toBe(true);
      expect(btn.className).toContain("disabled:opacity-45");
      expect(btn.className).toContain("disabled:pointer-events-none");
    });
  });

  describe("Card Component", () => {
    it("renders card with header, title, description, content, and footer", () => {
      render(
        <Card data-testid="card-root">
          <CardHeader>
            <CardTitle>Fit Passport</CardTitle>
            <CardDescription>Your universal clothing identity</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Chest: 980mm</p>
          </CardContent>
          <CardFooter>
            <span>Verified</span>
          </CardFooter>
        </Card>
      );

      const card = screen.getByTestId("card-root");
      expect(card.className).toContain("rounded-[10px]");
      expect(card.className).toContain("border-[var(--border)]");
      expect(card.className).toContain("bg-[var(--bg-surface)]");
      expect(card.className).toContain("hover:-translate-y-0.5");

      expect(screen.getByText("Fit Passport")).toBeDefined();
      expect(screen.getByText("Your universal clothing identity")).toBeDefined();
      expect(screen.getByText("Chest: 980mm")).toBeDefined();
      expect(screen.getByText("Verified")).toBeDefined();
    });
  });

  describe("Input Component", () => {
    it("renders input with 44px touch target height and focus styling", () => {
      render(<Input placeholder="Enter chest measurement (mm)" />);
      const input = screen.getByPlaceholderText(/enter chest measurement/i);
      expect(input).toBeDefined();
      expect(input.className).toContain("h-[44px]");
      expect(input.className).toContain("min-h-[44px]");
      expect(input.className).toContain("rounded-[8px]");
    });

    it("renders error state when error prop is true", () => {
      render(<Input error placeholder="Invalid input" />);
      const input = screen.getByPlaceholderText(/invalid input/i);
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.className).toContain("border-[var(--destructive)]");
    });
  });

  describe("Select Component", () => {
    it("renders Select trigger with 44px min-height", () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toBeDefined();
      expect(trigger.className).toContain("h-[44px]");
      expect(trigger.className).toContain("min-h-[44px]");
      expect(trigger.className).toContain("border-[var(--border-strong)]");
    });
  });

  describe("Badge Component", () => {
    it("renders pill badge with uppercase styling and variants", () => {
      const { rerender } = render(<Badge variant="neutral">Verified</Badge>);
      let badge = screen.getByText("Verified");
      expect(badge.className).toContain("rounded-[100px]");
      expect(badge.className).toContain("uppercase");
      expect(badge.className).toContain("tracking-[0.04em]");

      rerender(<Badge variant="terracotta">Relaxed Fit</Badge>);
      badge = screen.getByText("Relaxed Fit");
      expect(badge.className).toContain("bg-[var(--terracotta-subtle)]");
      expect(badge.className).toContain("text-[var(--terracotta)]");

      rerender(<Badge variant="success">96% Match</Badge>);
      badge = screen.getByText("96% Match");
      expect(badge.className).toContain("bg-[var(--success-subtle)]");
      expect(badge.className).toContain("text-[var(--success)]");
    });
  });

  describe("ConfidenceDot Component", () => {
    it("calculates confidence levels correctly from score", () => {
      expect(getConfidenceLevel(0.95)).toBe("high");
      expect(getConfidenceLevel(0.85)).toBe("high");
      expect(getConfidenceLevel(0.75)).toBe("medium");
      expect(getConfidenceLevel(0.65)).toBe("medium");
      expect(getConfidenceLevel(0.50)).toBe("low");
      expect(getConfidenceLevel(0.40)).toBe("low");
      expect(getConfidenceLevel(0.20)).toBe("none");
    });

    it("renders accessible status role and aria-label", () => {
      render(<ConfidenceDot level="high" />);
      const dot = screen.getByRole("status");
      expect(dot).toBeDefined();
      expect(dot.getAttribute("aria-label")).toContain("High Confidence");
    });

    it("displays visible label when showLabel is true", () => {
      render(<ConfidenceDot score={0.92} showLabel />);
      expect(screen.getByText(/High Confidence/i)).toBeDefined();
    });

    it("renders medium confidence dot correctly", () => {
      render(<ConfidenceDot level="medium" data-testid="dot-medium" />);
      const dot = screen.getByTestId("dot-medium");
      expect(dot.getAttribute("aria-label")).toContain("Medium Confidence");
    });

    it("renders low and none confidence dots", () => {
      const { rerender } = render(<ConfidenceDot level="low" data-testid="dot-test" />);
      let dot = screen.getByTestId("dot-test");
      expect(dot.getAttribute("aria-label")).toContain("Low Confidence");

      rerender(<ConfidenceDot level="none" data-testid="dot-test" />);
      dot = screen.getByTestId("dot-test");
      expect(dot.getAttribute("aria-label")).toContain("Insufficient Data");
    });
  });
});
