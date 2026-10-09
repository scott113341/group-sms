import Koa from "koa";
import { koaBody } from "koa-body";
import KoaRouter from "@koa/router";
import * as z from "zod";

import { routeCommand } from "./lib/commands.ts";
import { routeMessage } from "./lib/messages.ts";
import { loadPeople } from "./lib/people.ts";

// The subset of Twilio's incoming message webhook parameters that we use
const IncomingMessageParams = z.object({
  From: z.string(),
  Body: z.string(),
});

const app = new Koa();
const router = new KoaRouter();

router.get("/", async (ctx) => {
  ctx.response.body = "ok";
});

router.post("/incoming-message", async (ctx) => {
  const parsed = IncomingMessageParams.safeParse(ctx.request.body);
  if (!parsed.success) {
    console.log("invalid request", z.prettifyError(parsed.error));
    ctx.response.status = 400;
    ctx.response.body = z.prettifyError(parsed.error);
    return;
  }
  const params = parsed.data;

  const peopleGroups = await loadPeople();
  const from = params.From;
  const text = params.Body.trim();
  const sender = peopleGroups.PEOPLE.findBy("number", from);
  console.log({ from, text, sender });

  if (sender === undefined) {
    console.log("unknown sender");
  } else if (await routeCommand({ from, text, sender }, peopleGroups)) {
    console.log("routed command");
  } else if (text[0] === "/") {
    console.log("invalid command");
  } else if (await routeMessage({ from, text, sender }, peopleGroups)) {
    console.log("routed message");
  } else {
    console.log("errored");
  }

  ctx.response.set("Content-Type", "text/xml");
  ctx.response.body = "<Response></Response>";
});

router.post("/conference-call", async (ctx) => {
  ctx.response.set("Content-Type", "text/xml");
  ctx.response.body = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Please wait for others to join the call.</Say>
      <Dial>
        <Conference>group-sms</Conference>
      </Dial>
    </Response>
  `.trim();
});

app.use(koaBody()).use(router.routes());

const port = parseInt(process.env.PORT || "3000", 10);
const server = app.listen(port, () => console.log(`Listening on ${port}`));
process.on("SIGTERM", () => server.close());
