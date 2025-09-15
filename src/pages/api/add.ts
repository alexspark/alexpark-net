import type { APIRoute, APIContext } from "astro";

export const prerender = false;

export const GET: APIRoute = ({ request }: APIContext) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    console.log(Object.fromEntries(searchParams.entries()));
    const a = Number(searchParams.get("a"));
    const b = Number(searchParams.get("b"));

    if (isNaN(a) || isNaN(b)) {
        return new Response(JSON.stringify({ error: "Invalid query parameters" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }
    const sum = a + b;
    return new Response(JSON.stringify({ result: sum }), {
        headers: { "Content-Type": "application/json" },
    });
};
