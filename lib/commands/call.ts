import squish from "dedent-js";

import { extractIds, peopleFromMixedIds } from "../people.ts";
import client from "../twilio-client.ts";
import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["call"]>) => {
  const ids = extractIds(args.ids);

  if (ids.size) {
    ids.add(sender.id);

    const people = peopleFromMixedIds(peopleGroups, ...ids);

    const calls = Array.from(people).map(async (p) => {
      await client.calls.create({
        url: process.env.TWILIO_CALL_URL!,
        to: p.number,
        from: process.env.TWILIO_NUMBER!,
        timeout: 15,
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
