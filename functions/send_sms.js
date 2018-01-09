const client = require('../lib/twilio-client.js');


/**
 * Sends SMS via Twilio.
 * @param {string} from Twilio number sending the message.
 * @param {any} to Phone number or array of phone numbers.
 * @param {string} message The message text.
 * @returns {array}
 */
module.exports = async (from = '', to, message) => {
  from = from || process.env.TWILIO_NUMBER;
  to = Array.isArray(to) ? to : [ to ];

  const promises = to.map(async number => {
    await client.messages.create({
      body: message,
      to: number,
      from: from,
    });
    return true;
  });

  return Promise.all(promises);
};
