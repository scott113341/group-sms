const withPgClient = require('../pg-client.js');
const sendSms = require('../send-sms.js');

module.exports = async ({ from, text, sender, peopleGroups, args }) => {
  const { group } = args;

  try {
    const result = await withPgClient((client) => {
      return client.query(`
        delete from groups
        where
          group_id = $1
          and person_id = $2
        `,
        [ group, sender.id ]
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
