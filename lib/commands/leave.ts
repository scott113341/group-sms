import withPgClient from "../pg-client.ts";
import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["leave"]>) => {
  const { group } = args;

  try {
    const result = await withPgClient((client) => {
      return client.query(
        `
        delete from groups
        where
          group_id = $1
          and person_id = $2
        `,
        [group, sender.id],
      );
    });

    if (result.rowCount === 0) throw new Error("not in group");

    await sendSms({
      to: sender.number,
      message: `You've been removed from ${group}`,
    });
  } catch (e) {
    await sendSms({
      to: sender.number,
      message: `Oops, you're not in the ${group} group`,
    });
  }
};
