import { DatabaseError } from "pg";

import withPgClient from "../pg-client.ts";
import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["join"]>) => {
  const { group } = args;

  if (group[0] !== "@") {
    return sendSms({
      to: sender.number,
      message: `Oops, you can't name a group "${args.group}"`,
    });
  }

  try {
    const result = await withPgClient((client) => {
      return client.query(
        `
        insert into groups
        select group_id, person_id from (values ($1, $2)) new_group(group_id, person_id)
        left join people on new_group.group_id = people.id
        where people.id is null
        `,
        [group, sender.id],
      );
    });

    // This will happen if the group name is a person's name
    if (result.rowCount === 0) throw "badgroup";

    await sendSms({
      to: sender.number,
      message: `You've been added to ${group}`,
    });
  } catch (e) {
    const dbError = e instanceof DatabaseError ? e : undefined;

    if (
      dbError?.code === "22001" ||
      dbError?.constraint === "groups_group_id_check" ||
      e === "badgroup"
    ) {
      return sendSms({
        to: sender.number,
        message: `Oops, you can't name a group "${group}"`,
      });
    } else {
      return sendSms({
        to: sender.number,
        message: `Oops, you're already in the ${group} group`,
      });
    }
  }
};
