const { routeCommand } = require('../lib/commands');
const { routeMessage } = require('../lib/messages');
const { loadPeople } = require('../lib/people.js');


/**
 * Handles incoming SMS from Twilio.
 * @returns {boolean}
 */
module.exports = async (context) => {
  const peopleGroups = await loadPeople();

  const { params } = context;
  const message = {
    from: params.From,
    text: params.Body.trim(),
    sender: peopleGroups.PEOPLE.findBy('number', params.From),
  };
  console.log(message);

  if (await routeCommand(message, peopleGroups, context)) return true;
  else if (message.text[0] === '/') return false;
  else if (await routeMessage(message, peopleGroups, context)) return true;
  else return false;
};
