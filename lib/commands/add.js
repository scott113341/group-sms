const squish = require("dedent-js");

const withPgClient = require("../pg-client.js");
const sendSms = require("../send-sms.js");

module.exports = async ({ from, text, sender, peopleGroups, args }) => {
  const { PEOPLE } = peopleGroups;
  const { groupId, people } = args;

  const peopleIds = new Set();

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

  const result = await withPgClient((client) =>
    client.query(
      `
    insert into groups(group_id, person_id)
    (select $1, unnest($2::text[]))
    on conflict do nothing
    returning person_id
    `,
      [groupId, [...peopleIds]]
    )
  );

  const added = new Set();
  result.rows.forEach((r) => added.add(r.person_id));

  const notAdded = new Set(peopleIds);
  result.rows.forEach((r) => notAdded.delete(r.person_id));

  const alreadyInGroup =
    notAdded.size >= 1 ? ` (${[...notAdded].join(", ")} already in group)` : "";

  if (added.size >= 1) {
    await sendSms({
      to: sender.number,
      message: squish`
        Successfully added ${[...added].join(
          ", "
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
