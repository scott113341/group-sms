const squish = require('dedent-js');
const lib = require('lib');

const { loadPeople } = require('../people.js');


/**
 * Command: /groups
 * @param {string} from
 * @param {string} text
 * @param {object} sender
 * @param {object} args
 * @returns {any}
 */
module.exports = async ({ from, text, sender, args, context }) => {
  const { GROUPS } = await loadPeople();

  await lib[`${context.service.identifier}.send_sms`]({
    to: sender.number,
    message: squish`
      Here's all the groups:
      
      ${GROUPS.all.map(g => g.id).join('\n')}
    `,
  });
};
