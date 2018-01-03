const Plivo = require('plivo');


/**
 * Sends SMS via Plivo.
 * @param {string} from Plivo number sending the message.
 * @param {any} to Phone number or array of phone numbers.
 * @param {string} message The message text.
 * @returns {object}
 */
module.exports = async (from = '', to, message) => {
  from = from || process.env.PLIVO_NUMBER;
  to = Array.isArray(to) ? to.join('<') : to;

  const client = new Plivo.Client();
  return client.messages.create(from, to, message);
};
