const client = require('./twilio-client.js');

module.exports = async ({ from = '', to, message }) => {
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
      return 'sent message';
    } else {
      return 'skipping message send because SEND_SMS !== true';
    }
  });

  return Promise.all(promises);
};
