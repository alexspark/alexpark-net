import type { APIContext } from "astro";

export const GET = async ({ url }: APIContext) => {
    return new Response(`hello from subtract end point ${url.searchParams.get("a")}`);
};