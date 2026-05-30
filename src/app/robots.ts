import type { MetadataRoute } from "next";
import { robotsConfig } from "@/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return robotsConfig;
}
