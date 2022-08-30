const Koa = require("koa");
const koaBody = require("koa-body");
const KoaRouter = require("@koa/router");

const { routeCommand } = require("./lib/commands");
const { routeMessage } = require("./lib/messages");
const { loadPeople } = require("./lib/people.js");

const app = new Koa();
const router = new KoaRouter();

router.get("/", async (ctx) => {
  ctx.response.body = "ok";
});

router.post("/incoming-message", async (ctx) => {
  const params = ctx.request.body;

  const peopleGroups = await loadPeople();
  const message = {
    from: params.get("From"),
    text: params.get("Body").trim(),
    sender: peopleGroups.PEOPLE.findBy("number", params.get("From")),
  };
  console.log(message);

  if (await routeCommand(message, peopleGroups)) {
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

router.get("/conference-call", async (ctx) => {
  ctx.response.set("Content-Type", "text/xml");
  ctx.response.body = `
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Please wait for others to join the call.</Say>
      <Dial>
        <Conference>${Date.now()}</Conference>
      </Dial>
    </Response>
  `;
});

app.use(koaBody()).use(router.routes());

const port = parseInt(process.env.PORT || 3000, 10);
app.listen(port, () => console.log(`Listening on ${port}`));
