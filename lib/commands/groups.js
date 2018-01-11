const squish = require('dedent-js');
const lib = require('lib');


module.exports = async ({ from, text, sender, peopleGroups, args, context }) => {
  const { GROUPS } = peopleGroups;

  await lib[`${context.service.identifier}.send_sms`]({
    to: sender.number,
    message: squish`
      Here's all the groups:
      
      ${GROUPS.all.map(g => g.id).join('\n')}
    `,
  });
};
