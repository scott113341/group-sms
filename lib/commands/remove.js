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
    delete from groups
    where
      group_id = $1
      and person_id = ANY($2::text[])
    returning person_id
    `,
      [groupId, [...peopleIds]]
    )
  );

  const deleted = new Set();
  result.rows.forEach((r) => deleted.add(r.person_id));

  const notDeleted = new Set(peopleIds);
  result.rows.forEach((r) => notDeleted.delete(r.person_id));

  const notInGroup =
    notDeleted.size >= 1 ? ` (${[...notDeleted].join(", ")} not in group)` : "";

  if (deleted.size >= 1) {
    await sendSms({
      to: sender.number,
      message: squish`
        Successfully removed ${[...deleted].join(
          ", "
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
