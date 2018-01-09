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
module.exports = async ({ from, text, sender, args, context }) => {
  await lib[`${context.service.identifier}.send_sms`]({
    to: sender.number,
    message: squish`
      These are the things you can do:
      
      @someperson @somegroup yo where u at?
      Sends a message to people/groups listed
      
      /info
      No arguments: Info about you
      @someperson: Info about the person
      @somegroup: Members in the group
      
      /groups
      Lists all groups
      
      /call @someperson @somegroup
      Starts a conference call with people/groups listed
      
      /help
      Returns this message
    `,
  });
};