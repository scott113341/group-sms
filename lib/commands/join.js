const squish = require('dedent-js');
const lib = require('lib');

const { loadPeople, GROUPS } = require('../people.js');
const withPgClient = require('../pg-client.js');


/**
 * Command: /join
 * @param {string} from
 * @param {string} text
 * @param {object} sender
 * @param {object} args
 * @returns {any}
 */
module.exports = async ({ from, text, sender, args, context }) => {
  const { group } = args;

  if (group[0] !== '@') {
    return lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `Oops, you can't name a group "${args.group}"`,
    });
  }

  try {
    await withPgClient((client) => {
      return client.query(`insert into groups values ($1, $2)`, [ group, sender.id ]);
    });

    await lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `You've been added to ${group}`,
    });

  } catch (e) {

    await lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: `Oops, you're already in the ${group} group`,
    });
  }
};
