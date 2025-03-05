import type { APIRoute } from "astro";
import { commandLog } from "./_log";

export const GET: APIRoute = async ({ cookies, url }) => {
  const latestLogIndexCookie = cookies.get("state");
  let latestLogIndex = -1;
  if (latestLogIndexCookie) {
    latestLogIndex = latestLogIndexCookie.number();
  }

  const run = commandLog.slice(latestLogIndex + 1);
  cookies.set("state", String(commandLog.length - 1));

  return new Response(JSON.stringify({ run }), { status: 200 });
};
