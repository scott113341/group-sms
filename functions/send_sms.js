const Plivo = require('plivo');


/**
 * Sends SMS
 * @param {string} from Phone number sending the message
 * @param {any} to Phone numbers
 * @param {string} message The text message
 * @returns {object}
 */
module.exports = async (from = '', to, message) => {
  from = from || process.env.PLIVO_NUMBER;
  to = Array.isArray(to) ? to.join('<') : to;

  const client = new Plivo.Client();
  return client.messages.create(from, to, message);
};
