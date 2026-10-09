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
}: CommandContext<CommandArgs["add"]>) => {
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
        insert into groups(group_id, person_id)
        (select $1, unnest($2::text[]))
        on conflict do nothing
        returning person_id
      `,
      [groupId, [...peopleIds]],
    ),
  );

  const added = new Set();
  rows.forEach((r) => added.add(r.person_id));

  const notAdded = new Set(peopleIds);
  rows.forEach((r) => notAdded.delete(r.person_id));

  const alreadyInGroup =
    notAdded.size >= 1 ? ` (${[...notAdded].join(", ")} already in group)` : "";

  if (added.size >= 1) {
    await sendSms({
      to: sender.number,
      message: squish`
        Successfully added ${[...added].join(
          ", ",
        )} to the ${groupId} group${alreadyInGroup}
      `,
    });
  } else {
    await sendSms({
      to: sender.number,
      message: squish`
        Oops, looks like all of those people are already in the ${groupId} group
      `,
    });
  }
};
