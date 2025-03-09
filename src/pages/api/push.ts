import type { APIRoute } from "astro";
import { z } from "zod";
import { mutation } from "../../queries";
import { run, addMutationLogEntry } from "../../lib/server";

const payloadSchema = z.object({
  clientId: z.string(),
  mutator: z.string().refine((mutator) => mutator in mutation, {
    message: "Invalid mutator",
  }),
  args: z.any(),
});

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const payload = payloadSchema.safeParse(body);
  if (!payload.success) {
    return new Response(`Invalid payload: ${payload.error}`, {
      status: 400,
    });
  }

  const { clientId, mutator, args } = payload.data;
  const mutatorFn = mutation[mutator as keyof typeof mutation];

  addMutationLogEntry({ clientId, mutator, args });
  run(mutatorFn(args));

  return new Response("Mutation successful", { status: 200 });
};
