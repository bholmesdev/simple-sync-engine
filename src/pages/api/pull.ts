import type { APIRoute } from "astro";
import { commandLog } from "./_log";

export const GET: APIRoute = async ({ cookies, url }) => {
  const latestLogIndexCookie = cookies.get("state");
  const reset = url.searchParams.get("reset");
  let latestLogIndex = -1;
  if (!reset && latestLogIndexCookie) {
    latestLogIndex = latestLogIndexCookie.number();
  }

  console.log({ latestLogIndex });

  const run = commandLog.filter((command, idx) => idx > latestLogIndex);
  cookies.set("state", String(commandLog.length - 1));

  return new Response(JSON.stringify({ run }), { status: 200 });
};
