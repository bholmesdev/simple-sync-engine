import type { APIRoute } from "astro";
import { z } from "zod";
import { mutation } from "../../queries";
import { run, addMutationLogEntry } from "../../lib/server";

export const POST: APIRoute = async ({ request }) => {
  return new Response("pushed");
};
