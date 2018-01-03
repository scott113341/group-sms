const squish = require('dedent-js');
const lib = require('lib');

const { GROUPS } = require('../lib/people');


/**
 * Command: /help
 * @param {string} from
 * @param {string} text
 * @param {object} sender
 * @param {object} args
 * @returns {any}
 */
module.exports = async (from, text, sender, args, context) => {
  const groupId = args.group ? args.group.replace(/^([^@])/, '@$1') : '@all';
  const group = GROUPS.findBy('id', groupId);

  const names = group.people
    .map(p => `${p.id} - ${p.number}`)
    .join('\n');

  await lib[`${context.service.identifier}.send_sms`]({
    to: sender.number,
    message: squish`
      Here's everyone in the ${groupId} group:
      
      ${names}
    `,
  });
};
