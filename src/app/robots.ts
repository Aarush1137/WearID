import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wear-id.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/app/compare",
          "/app/explore",
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
