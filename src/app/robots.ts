import { MetadataRoute } from "next";

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") && envUrl.startsWith("http")) {
    return envUrl.replace(/\/$/, "");
  }
  return "https://wear-id.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/app",
          "/app/compare",
          "/app/explore",
          "/app/quick-lookup",
          "/app/wardrobe",
          "/app/wishlist",
          "/app/ease-guide",
          "/app/brand-requests",
          "/app/outfits",
          "/app/family",
          "/app/assistant",
          "/methodology",
          "/privacy",
          "/login",
          "/onboarding",
          "/media/",
          "/icons/",
        ],
        disallow: [
          "/api/",
          "/app/profile",
          "/app/privacy-settings",
          "/sandbox/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
