const squish = require('dedent-js');

const sendSms = require('../send-sms.js');

module.exports = async ({ from, text, sender, peopleGroups, args }) => {
  const { GROUPS } = peopleGroups;

  await sendSms({
    to: sender.number,
    message: squish`
      Here's all the groups:
      
      ${GROUPS.all.map(g => g.id).join('\n')}
    `,
  });
};
