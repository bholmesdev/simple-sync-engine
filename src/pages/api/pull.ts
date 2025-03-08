import type { APIRoute } from "astro";
import { commandLog } from "./_log";

export type PullResponse = {
  flushCount: number;
  commands: Array<{
    clientId: string;
    mutator: string;
    args: any;
  }>;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  const latestLogIndexCookie = cookies.get("state");
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    return new Response("Client ID is required", { status: 400 });
  }
  let latestLogIndex = -1;
  if (latestLogIndexCookie) {
    latestLogIndex = latestLogIndexCookie.number();
  }

  const commands = commandLog.slice(latestLogIndex + 1);
  const flushCount = commands.filter(
    (command) => command.clientId === clientId
  ).length;
  cookies.set("state", String(commandLog.length - 1));

  return new Response(JSON.stringify({ commands, flushCount }), {
    status: 200,
  });
};
