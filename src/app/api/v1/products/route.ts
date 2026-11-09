import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mocks/mock-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const brandId = searchParams.get("brand");
    const category = searchParams.get("category");

    if (id) {
      const product = mockStore.getProduct(id);
      if (!product) {
        return NextResponse.json(
          {
            type: "https://wearid.in/errors/not-found",
            title: "Product Not Found",
            status: 404,
            detail: `Product with identifier '${id}' was not found in catalog.`,
          },
          { status: 404, headers: { "Content-Type": "application/problem+json" } }
        );
      }
      return NextResponse.json(product);
    }

    let products = mockStore.getProducts(brandId || undefined);

    if (category) {
      products = products.filter((p) => p.category === category);
    }

    return NextResponse.json({
      data: products,
      total: products.length,
      provenance: {
        curatedBy: "WearID Governance & Data Audit",
        canonicalUnit: "mm",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: "https://wearid.in/errors/internal",
        title: "Internal Server Error",
        status: 500,
        detail: err?.message || "Failed to retrieve products catalog.",
      },
      { status: 500, headers: { "Content-Type": "application/problem+json" } }
    );
  }
}
