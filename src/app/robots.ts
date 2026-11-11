import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Emitted as a file at build time. `output: "export"` requires metadata routes
// to say so explicitly, since there is no server to generate them per request.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
