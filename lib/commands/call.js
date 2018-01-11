const squish = require('dedent-js');
const lib = require('lib');

const { extractIds, peopleFromMixedIds } = require('../people.js');
const client = require('../twilio-client.js');


module.exports = async ({ from, text, sender, peopleGroups, args, context }) => {
  const ids = extractIds(args.ids);

  if (ids.size) {
    ids.add(sender.id);

    const people = peopleFromMixedIds(peopleGroups, ...ids);

    const calls = Array.from(people).map(async p => {
      await client.calls.create({
        url: process.env.TWILIO_CALL_URL,
        to: p.number,
        from: process.env.TWILIO_NUMBER,
        timeout: '15',
      });
      return true;
    });

    return Promise.all(calls);
  } else {
    return lib[`${context.service.identifier}.send_sms`]({
      to: sender.number,
      message: squish`
        Whoops, you need to specify some people to call!
      `,
    });
  }
};
