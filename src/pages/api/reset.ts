import type { APIRoute } from "astro";

export const GET: APIRoute = ({ cookies }) => {
  cookies.delete("lastLogId");
  return new Response();
};
