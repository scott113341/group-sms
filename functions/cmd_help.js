const squish = require('dedent-js');
const lib = require('lib');


/**
 * Command: /help
 * @param {string} from
 * @param {string} text
 * @param {object} sender
 * @param {object} args
 * @returns {any}
 */
module.exports = async (from, text, sender, args, context) => {
  await lib[`${context.service.identifier}.send_sms`]({
    to: sender.number,
    message: squish`
      These are the commands you can use:
      
      @someperson @somegroup yo where u at?
      Sends a message to all people and members of groups listed
      
      /members @somegroup
      Lists all members in the specified group
      
      /groups
      Lists all groups
      
      /help
      Returns this message
    `,
  });
};
