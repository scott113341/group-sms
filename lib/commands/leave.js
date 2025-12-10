import withPgClient from "../pg-client.js";
import sendSms from "../send-sms.js";

export default async ({ from, text, sender, peopleGroups, args }) => {
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
        [group, sender.id]
      );
    });

    if (result.rowCount === 0) throw Error;

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
