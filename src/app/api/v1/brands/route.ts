import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mocks/mock-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    let brands = mockStore.getBrands();

    if (id) {
      const single = mockStore.getBrand(id);
      if (!single) {
        return NextResponse.json(
          {
            type: "https://wearid.in/errors/not-found",
            title: "Brand Not Found",
            status: 404,
            detail: `Pilot brand with identifier '${id}' was not found in catalog.`,
          },
          { status: 404, headers: { "Content-Type": "application/problem+json" } }
        );
      }
      return NextResponse.json(single);
    }

    return NextResponse.json({
      data: brands,
      total: brands.length,
      provenance: {
        curatedBy: "WearID Governance & Data Audit",
        policyAdherence: "AGENTS.md Invariants 1, 2, 5, 6",
        canonicalUnit: "mm",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: "https://wearid.in/errors/internal",
        title: "Internal Server Error",
        status: 500,
        detail: err?.message || "Failed to retrieve brands catalog.",
      },
      { status: 500, headers: { "Content-Type": "application/problem+json" } }
    );
  }
}
