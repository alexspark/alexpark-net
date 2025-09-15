import type { APIRoute, APIContext } from "astro";

export const GET: APIRoute = ({ request }: APIContext) => {
    const searchParams = new URLSearchParams(request.url);
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
