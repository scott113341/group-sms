const lib = require('lib');

const withPgClient = require('../pg-client.js');


module.exports = async ({ from, text, sender, peopleGroups, args, context }) => {
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

    await lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `You've been removed from ${group}`,
    });

  } catch (e) {

    await lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `Oops, you're not in the ${group} group`,
    });
  }
};
