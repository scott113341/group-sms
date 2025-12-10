import squish from "dedent-js";

import { extractIds, peopleFromMixedIds } from "../people.js";
import client from "../twilio-client.js";
import sendSms from "../send-sms.js";

export default async ({ from, text, sender, peopleGroups, args }) => {
  const ids = extractIds(args.ids);

  if (ids.size) {
    ids.add(sender.id);

    const people = peopleFromMixedIds(peopleGroups, ...ids);

    const calls = Array.from(people).map(async (p) => {
      await client.calls.create({
        url: process.env.TWILIO_CALL_URL,
        to: p.number,
        from: process.env.TWILIO_NUMBER,
        timeout: "15",
      });
      return true;
    });

    return Promise.all(calls);
  } else {
    return sendSms({
      to: sender.number,
      message: squish`
        Whoops, you need to specify some people to call!
      `,
    });
  }
};
