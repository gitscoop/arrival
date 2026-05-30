import type { MetadataRoute } from "next";
import { sitemapUrls } from "@/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls;
}
