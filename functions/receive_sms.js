const lib = require('lib');

const { routeCommand } = require('../lib/commands');
const { routeMessage } = require('../lib/messages');
const { PEOPLE } = require('../lib/people.js');


/**
 * Handles incoming SMS from Plivo.
 * @returns {boolean}
 */
module.exports = async (context) => {
  const { params } = context;
  const message = {
    from: params.From,
    text: params.Text,
    sender: PEOPLE.findBy('number', params.From),
  };
  console.log(message);

  if (await routeCommand(message, context)) return true;
  else if (message.text[0] === '/') return false;
  else if (await routeMessage(message, context)) return true;
  else return false;
};
