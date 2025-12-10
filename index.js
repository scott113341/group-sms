import Koa from "koa";
import { koaBody } from "koa-body";
import KoaRouter from "@koa/router";

import { routeCommand } from "./lib/commands.js";
import { routeMessage } from "./lib/messages.js";
import { loadPeople } from "./lib/people.js";

const app = new Koa();
const router = new KoaRouter();

router.get("/", async (ctx) => {
  ctx.response.body = "ok";
});

router.post("/incoming-message", async (ctx) => {
  const params = ctx.request.body;

  const peopleGroups = await loadPeople();
  const message = {
    from: params.From,
    text: params.Body.trim(),
    sender: peopleGroups.PEOPLE.findBy("number", params.From),
  };
  console.log(message);

  if (message.sender === undefined) {
    console.log("unknown sender");
  } else if (await routeCommand(message, peopleGroups)) {
    console.log("routed command");
  } else if (message.text[0] === "/") {
    console.log("invalid command");
  } else if (await routeMessage(message, peopleGroups)) {
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

const port = parseInt(process.env.PORT || 3000, 10);
const server = app.listen(port, () => console.log(`Listening on ${port}`));
process.on("SIGTERM", () => server.close());
