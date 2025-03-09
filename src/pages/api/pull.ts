import type { APIRoute } from "astro";
import { getMutationLog } from "../../lib/log.server";

export type PullResponse = {
  flushCount: number;
  commands: Array<{
    clientId: string;
    mutator: string;
    args: any;
  }>;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  const lastLogIdCookie = cookies.get("lastLogId");
  const clientId = url.searchParams.get("clientId");
  if (!clientId) {
    return new Response("Client ID is required", { status: 400 });
  }
  const lastLogId = lastLogIdCookie?.number();
  const commands = getMutationLog(lastLogId);

  const flushCount = commands.filter(
    (command) => command.clientId === clientId
  ).length;
  const latestCommand = commands.at(-1);
  if (latestCommand) {
    cookies.set("lastLogId", latestCommand.id.toString());
  }

  return new Response(JSON.stringify({ commands, flushCount }), {
    status: 200,
  });
};
