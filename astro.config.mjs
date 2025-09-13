import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://e0fdd15c.alexpark-net.pages.dev",
  integrations: [mdx(), sitemap(), tailwind()],
  adapter: cloudflare(),
});