import squish from "dedent-js";
import * as z from "zod";

import withPgClient, { queryRows } from "../pg-client.ts";
import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["remove"]>) => {
  const { PEOPLE } = peopleGroups;
  const { groupId, people } = args;

  const peopleIds = new Set<string>();

  for (const personId of people.split(/\s+/)) {
    const person = PEOPLE.findBy("id", personId.trim());

    if (person) {
      peopleIds.add(person.id);
    } else {
      return sendSms({
        to: sender.number,
        message: squish`
          Oops, couldn't find any people named "${personId}"
        `,
      });
    }
  }

  const rows = await withPgClient((client) =>
    queryRows(
      client,
      z.object({ person_id: z.string() }),
      `
    delete from groups
    where
      group_id = $1
      and person_id = ANY($2::text[])
    returning person_id
    `,
      [groupId, [...peopleIds]],
    ),
  );

  const deleted = new Set();
  rows.forEach((r) => deleted.add(r.person_id));

  const notDeleted = new Set(peopleIds);
  rows.forEach((r) => notDeleted.delete(r.person_id));

  const notInGroup =
    notDeleted.size >= 1 ? ` (${[...notDeleted].join(", ")} not in group)` : "";

  if (deleted.size >= 1) {
    await sendSms({
      to: sender.number,
      message: squish`
        Successfully removed ${[...deleted].join(
          ", ",
        )} from the ${groupId} group${notInGroup}
      `,
    });
  } else {
    await sendSms({
      to: sender.number,
      message: squish`
        Oops, looks like none of those people were in the ${groupId} group
      `,
    });
  }
};
