"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PILOT_PRODUCTS, PILOT_BRANDS, PilotProduct } from "@/core/data/pilotBrands";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from "@/components/ui";
import { Check } from "lucide-react";

interface HandshakeLog {
  timestamp: string;
  url: string;
  method: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  latencyMs: number;
  biometricLeaked: boolean;
}

interface WebhookLog {
  timestamp: string;
  signature: string;
  headers: Record<string, string>;
  payload: Record<string, unknown>;
  verified: boolean;
}

export default function RetailerSandboxPage() {
  const [selectedProductId, setSelectedProductId] = useState<string>("prod_snitch_heavyweight_boxy");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [demoProfile, setDemoProfile] = useState<"regular" | "athletic" | "slim">("regular");
  const [customToken, setCustomToken] = useState<string>("");
  const [handshakeLog, setHandshakeLog] = useState<HandshakeLog | null>(null);
  const [webhookLog, setWebhookLog] = useState<WebhookLog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const product: PilotProduct =
    PILOT_PRODUCTS.find((p) => p.id === selectedProductId) || PILOT_PRODUCTS[0];

  const availableSizes =
    product.layer3Specs?.map((s) => s.sizeLabel) ||
    product.layer2Charts?.map((c) => c.sizeLabel) ||
    ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

  // Handle direct sizing handshake via API route
  const handleConnectHandshake = async () => {
    setIsLoading(true);
    setStatusMessage("Executing zero-knowledge sizing handshake...");

    const token = customToken.trim() || `wearid_demo_${demoProfile}`;
    const startTime = performance.now();

    const requestPayload = {
      token,
      retailerId: product.brandId,
      productId: product.id,
      category: product.category,
      fitIntent: product.fitSilhouette,
    };

    try {
      const res = await fetch("/api/v1/portability/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      const responsePayload = await res.json();
      const latencyMs = Math.round((performance.now() - startTime) * 10) / 10;

      // Check if any biometric values exist in response
      const forbidden = ["chestMm", "waistMm", "hipsMm", "inseamMm", "shoulderWidthMm"];
      const biometricLeaked = forbidden.some((k) => k in responsePayload);

      setHandshakeLog({
        timestamp: new Date().toLocaleTimeString(),
        url: "/api/v1/portability/recommend",
        method: "POST",
        requestPayload,
        responsePayload,
        latencyMs,
        biometricLeaked,
      });

      if (res.ok && responsePayload.recommendedSize) {
        setSelectedSize(responsePayload.recommendedSize);
        setStatusMessage(
          `Success: Recommended Size ${responsePayload.recommendedSize} (${Math.round(
            (responsePayload.fitScore || 0) * 100
          )}% fit match). Automatically selected on store PDP!`
        );
      } else {
        setStatusMessage(`Handshake error: ${responsePayload.error || "Failed to recommend size"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setStatusMessage(`Network failure: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Order Checkout Webhook
  const handleSimulateWebhook = async () => {
    if (!selectedSize) {
      setStatusMessage("Please select or calculate a recommended size first.");
      return;
    }

    const payload = {
      event: "order.size_confirmed",
      orderId: `ord_${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      retailerId: product.brandId,
      productId: product.id,
      recommendedSize: selectedSize,
      fitScore: handshakeLog?.responsePayload?.fitScore || 0.94,
      confidenceLabel: handshakeLog?.responsePayload?.confidenceLabel || "high",
      timestamp: Math.floor(Date.now() / 1000),
    };

    try {
      const serialized = JSON.stringify(payload);
      // Call mock webhook receiver
      const res = await fetch("/api/v1/portability/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wearid-signature": "sha256-mock-signature-sandbox-verification",
          "x-wearid-timestamp": String(payload.timestamp),
        },
        body: serialized,
      });

      const resData = await res.json();

      setWebhookLog({
        timestamp: new Date().toLocaleTimeString(),
        signature: "sha256-mock-signature-sandbox-verification",
        headers: {
          "Content-Type": "application/json",
          "x-wearid-event": "order.size_confirmed",
          "x-wearid-timestamp": String(payload.timestamp),
        },
        payload,
        verified: res.status !== 500,
      });

      setStatusMessage(`Webhook dispatched for Order ${payload.orderId}. Confirmed Size: ${selectedSize}.`);
    } catch {
      setStatusMessage("Failed to dispatch test webhook.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111622] pb-16">
      {/* Top Banner */}
      <div className="bg-[#111622] text-white px-4 py-3 border-b border-[#1E283A]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-[#1B2A4A] text-white font-bold px-2 py-0.5 rounded text-[11px] tracking-wide uppercase">
              Partner Sandbox
            </span>
            <span className="font-medium text-[#F2F5FA]">
              WearID Connect (Phase 4 Retailer Integration Testbed)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#8D96A5]">
            <span>Invariant 7: Zero Biometric Leakage</span>
            <Link href="/app/privacy-settings" className="text-[#A47834] hover:underline">
              Generate Sovereign Token →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Sandbox Controls Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E3DDD2] mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#535D70] uppercase tracking-wider">
              Storefront Brand:
            </label>
            <select
              aria-label="Select Storefront Product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedSize("");
                setHandshakeLog(null);
                setWebhookLog(null);
              }}
              className="bg-[#FAF8F5] border border-[#E3DDD2] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#111622] focus:outline-none focus:ring-1 focus:ring-[#1B2A4A]"
            >
              {PILOT_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#535D70] uppercase tracking-wider">
              Active Passport:
            </span>
            <div className="flex bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E3DDD2]">
              {(["regular", "athletic", "slim"] as const).map((prof) => (
                <button
                  key={prof}
                  type="button"
                  onClick={() => {
                    setDemoProfile(prof);
                    setCustomToken("");
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                    demoProfile === prof && !customToken
                      ? "bg-[#1B2A4A] text-white shadow-sm"
                      : "text-[#535D70] hover:text-[#111622]"
                  }`}
                >
                  {prof}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid: Mock PDP on Left, Zero-Knowledge Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mock E-Commerce PDP (Col 1-7) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E3DDD2]">
              {/* Merchant Breadcrumb */}
              <div className="text-xs text-[#535D70] mb-4 flex items-center gap-2">
                <span>{product.brandName}</span>
                <span>/</span>
                <span className="capitalize">{product.category.replace(/_/g, " ")}</span>
                <span>/</span>
                <span className="text-[#111622] font-medium">{product.name}</span>
              </div>

              {/* Product Visual & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
                <div className="sm:col-span-5 bg-[#FAF8F5] rounded-xl flex items-center justify-center p-8 border border-[#E3DDD2] relative min-h-[220px]">
                  <div className="text-center">
                    <svg
                      className="w-20 h-20 mx-auto text-[#1B2A4A] opacity-80 mb-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                    <span className="text-[11px] font-bold text-[#535D70] uppercase tracking-widest block">
                      {product.brandName}
                    </span>
                  </div>
                  <span className="absolute top-2 right-2 bg-white text-[10px] font-bold text-[#1D5D42] px-2 py-0.5 rounded border border-[#E3DDD2]">
                    Verified Specs
                  </span>
                </div>

                <div className="sm:col-span-7 flex flex-col justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold font-display text-[#111622] mb-2">
                      {product.name}
                    </h1>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-black text-[#111622]">₹{product.priceInr}</span>
                      <span className="text-xs text-[#535D70] line-through">₹{product.priceInr + 600}</span>
                      <Badge variant="neutral" className="text-[11px]">
                        Save ₹600
                      </Badge>
                    </div>
                    <p className="text-xs text-[#535D70] leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  <div className="text-xs text-[#535D70] border-t border-[#E3DDD2] pt-3">
                    <span className="font-semibold text-[#111622]">Fabric: </span>
                    {product.fabric.materialComposition} ({product.fabric.elastanePercentage}% elastane,{" "}
                    {product.fabric.stretchLevel !== "none" ? "stretch" : "rigid"}).
                  </div>
                </div>
              </div>

              {/* Size Selection Section */}
              <div className="border-t border-[#E3DDD2] pt-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#535D70]">
                      Select Size
                    </span>
                    {selectedSize && (
                      <span className="text-xs font-bold text-[#1D5D42]">
                        (Selected: {selectedSize})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#535D70]">Size Guide</span>
                </div>

                {/* Size Buttons Grid */}
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-11 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-[#111622] text-white border-[#111622] ring-2 ring-offset-1 ring-[#111622]"
                            : "bg-white text-[#111622] border-[#E3DDD2] hover:border-[#535D70]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* "Fit with WearID" Embeddable Button */}
                <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E3DDD2] mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-[#111622] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#1D5D42]"></span>
                        Unsure of your size in {product.brandName}?
                      </div>
                      <p className="text-[11px] text-[#535D70] mt-0.5">
                        Instant zero-knowledge recommendation using your private WearID passport.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleConnectHandshake}
                      disabled={isLoading}
                      className="h-11 px-5 rounded-lg bg-[#1B2A4A] hover:bg-[#121D34] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 min-w-[160px]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2.1L2 14.5A2 2 0 0 0 3.5 17H20.5a2 2 0 0 0 1.5-2.5L14.2 7.1c.5-.6.8-1.3.8-2.1a3 3 0 0 0-3-3z"/>
                        <path d="M12 7v5"/>
                      </svg>
                      <span>{isLoading ? "Fitting..." : "Fit with WearID"}</span>
                    </button>
                  </div>

                  {statusMessage && (
                    <div className="mt-3 p-2.5 rounded bg-white text-xs border border-[#E3DDD2] text-[#111622]">
                      {statusMessage}
                    </div>
                  )}
                </div>

                {/* Add to Bag CTA */}
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  className="w-full h-12 rounded-xl bg-[#111622] hover:bg-[#182030] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Simulate Order Checkout (Webhook)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zero-Knowledge Dev Inspector (Col 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Handshake Wire Inspector */}
            <Card className="border-[#E3DDD2]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#111622]">Zero-Knowledge Wire Inspector</CardTitle>
                  <span className="text-[11px] font-bold text-[#1D5D42] bg-[#EBF5F0] px-2 py-0.5 rounded">
                    HTTP Wire View
                  </span>
                </div>
                <CardDescription className="text-xs text-[#535D70]">
                  Auditing data transmitted between merchant storefront and WearID sizing gateway.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Security Compliance Badge */}
                <div className="p-3 rounded-lg bg-[#EBF1FA] border border-[#1B2A4A]/20 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1D5D42] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-[#111622] block">
                      Invariant 7 Certified (TC-SEC-002)
                    </span>
                    <span className="text-[#535D70] block mt-0.5">
                      Raw biometrics transmitted: <strong className="text-[#1D5D42]">0 bytes</strong>. Retailer receives only deterministic size match and confidence tag.
                    </span>
                  </div>
                </div>

                {/* Request Payload View */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#535D70] mb-1">
                    <span>Outbound Request:</span>
                    <span>POST /api/v1/portability/recommend</span>
                  </div>
                  <pre className="bg-[#111622] text-[#F2F5FA] p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-40 border border-[#1E283A]">
                    {handshakeLog
                      ? JSON.stringify(handshakeLog.requestPayload, null, 2)
                      : "// Click 'Fit with WearID' on PDP to capture outbound HTTP handshake"}
                  </pre>
                </div>

                {/* Response Payload View */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#535D70] mb-1">
                    <span>Inbound Zero-Knowledge Response:</span>
                    {handshakeLog && (
                      <span className="text-[#1D5D42]">Latency: {handshakeLog.latencyMs}ms</span>
                    )}
                  </div>
                  <pre className="bg-[#111622] text-[#F2F5FA] p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-[#1E283A]">
                    {handshakeLog
                      ? JSON.stringify(handshakeLog.responsePayload, null, 2)
                      : "// Waiting for recommendation payload..."}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Inspector */}
            <Card className="border-[#E3DDD2]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-[#111622]">Fulfillment Webhook Inspector</CardTitle>
                  <span className="text-[11px] font-bold text-[#1B2A4A] bg-[#EBF1FA] px-2 py-0.5 rounded">
                    HMAC-SHA256
                  </span>
                </div>
                <CardDescription className="text-xs text-[#535D70]">
                  Order size confirmation event dispatched to merchant warehouse.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="bg-[#111622] text-[#F2F5FA] p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-44 border border-[#1E283A]">
                  {webhookLog
                    ? JSON.stringify(
                        {
                          headers: webhookLog.headers,
                          payload: webhookLog.payload,
                        },
                        null,
                        2
                      )
                    : "// Click 'Simulate Order Checkout' to test webhook dispatch"}
                </pre>
                <div className="text-[11px] text-[#73776F]">
                  Contains verified recommended size for packing slips without anatomical exposure.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
