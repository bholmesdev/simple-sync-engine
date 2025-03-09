import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete("lastLogId");
  return new Response("Reset", { status: 200 });
};
