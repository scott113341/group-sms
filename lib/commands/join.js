const lib = require('lib');

const withPgClient = require('../pg-client.js');


module.exports = async ({ from, text, sender, peopleGroups, args, context }) => {
  const { group } = args;

  if (group[0] !== '@') {
    return lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `Oops, you can't name a group "${args.group}"`,
    });
  }

  try {
    const result = await withPgClient((client) => {
      return client.query(`
        insert into groups
        select group_id, person_id from (values ($1, $2)) new_group(group_id, person_id)
        left join people on new_group.group_id = people.id
        where people.id is null
        `,
        [ group, sender.id ]
      );
    });

    // This will happen if the group name is a person't name
    if (result.rowCount === 0) throw 'badgroup';

    await lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `You've been added to ${group}`,
    });

  } catch (e) {
    if (e.code === '22001' || e.constraint === 'groups_group_id_check' || e === 'badgroup') {
      return lib[`${context.service.identifier}.send_sms`]({
        to: sender.number,
        message: `Oops, you can't name a group "${group}"`,
      });
    } else {
      return lib[`${context.service.identifier}.send_sms`]({
        to: sender.number,
        message: `Oops, you're already in the ${group} group`,
      });
    }
  }
};
