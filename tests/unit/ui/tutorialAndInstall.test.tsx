import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuidedTutorialModal } from "@/components/tutorial/GuidedTutorialModal";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

describe("GuidedTutorialModal Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <GuidedTutorialModal isOpen={false} onComplete={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Step 1 with Sovereign Measurement Passport when open", () => {
    render(<GuidedTutorialModal isOpen={true} onComplete={() => {}} />);
    expect(screen.getByText("Step 1 of 5")).toBeDefined();
    expect(screen.getByText("Your Sovereign Measurement Passport")).toBeDefined();
    expect(screen.getByText("Next Step")).toBeDefined();
  });

  it("advances through steps on Next click and persists completion on final step", () => {
    const onComplete = vi.fn();
    render(<GuidedTutorialModal isOpen={true} onComplete={onComplete} />);

    // Step 1 -> 2
    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Step 2 of 5")).toBeDefined();
    expect(screen.getByText("Interactive Body Silhouette")).toBeDefined();

    // Step 2 -> 3
    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Step 3 of 5")).toBeDefined();

    // Step 3 -> 4
    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Step 4 of 5")).toBeDefined();

    // Step 4 -> 5
    fireEvent.click(screen.getByText("Next Step"));
    expect(screen.getByText("Step 5 of 5")).toBeDefined();
    expect(screen.getByText(/Complete & Enter WearID/i)).toBeDefined();

    // Final Complete click
    fireEvent.click(screen.getByText(/Complete & Enter WearID/i));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(localStorage.getItem("wearid_tutorial_completed")).toBe("true");
  });
});

describe("PWA InstallPrompt Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render when already dismissed permanently in localStorage", () => {
    localStorage.setItem("wearid_install_dismissed", "true");
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });
});
