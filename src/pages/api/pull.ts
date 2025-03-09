import type { APIRoute } from "astro";
import { getMutationLog, isLogIdValid } from "../../lib/server";
import type { mutation } from "../../queries";

export type PullResponse = {
  flushCount: number;
  mutations: Array<{
    clientId: string;
    mutator: keyof typeof mutation;
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
  if (lastLogId && !isLogIdValid(lastLogId)) {
    cookies.delete("lastLogId");
    return new Response("Client is out of date - please reset", {
      status: 409,
    });
  }
  const mutations = getMutationLog(lastLogId);

  const flushCount = mutations.filter(
    (command) => command.clientId === clientId
  ).length;
  const latestCommand = mutations.at(-1);
  if (latestCommand) {
    cookies.set("lastLogId", latestCommand.id.toString());
  }

  return new Response(
    JSON.stringify({ mutations, flushCount } satisfies PullResponse),
    {
      status: 200,
    }
  );
};
