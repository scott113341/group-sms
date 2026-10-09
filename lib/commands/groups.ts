import squish from "dedent-js";

import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["groups"]>) => {
  const { GROUPS } = peopleGroups;

  await sendSms({
    to: sender.number,
    message: squish`
      Here's all the groups:
      
      ${GROUPS.all.map((g) => g.id).join("\n")}
    `,
  });
};
