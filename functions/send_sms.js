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
    const args = {
      body: message,
      to: number,
      from: from,
    };

    if (process.env.SEND_SMS === 'true') {
      await client.messages.create(args);
      return true;
    } else {
      console.log(args);
      return 'test';
    }
  });

  return Promise.all(promises);
};
