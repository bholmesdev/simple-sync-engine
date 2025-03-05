import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete("state");
  return new Response("Reset", { status: 200 });
};
