import type { APIRoute } from "astro";
import { getMutationLog, isLogIdValid } from "../../lib/server";
import type { mutation } from "../../queries";

export type PullResponse = {
  mutations: Array<{
    clientId: string;
    mutator: keyof typeof mutation;
    args: any;
  }>;
};

export const GET: APIRoute = async ({ cookies, url }) => {
  return new Response("TODO");
};
