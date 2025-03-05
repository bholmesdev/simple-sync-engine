import type { APIRoute } from "astro";
import { z } from "zod";
import { mutation } from "../../queries";
import { run } from "../../lib/db.server";
import { commandLog } from "./_log";

const payloadSchema = z.object({
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

  const { mutator, args } = payload.data;
  const mutatorFn = mutation[mutator as keyof typeof mutation];
  commandLog.push({ mutator, args });
  const stmt = mutatorFn(args);
  run(stmt);

  return new Response("Mutation successful", { status: 200 });
};
