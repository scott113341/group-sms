const squish = require('dedent-js');

const { peopleFromMixedIds, extractIds } = require('./people.js');
const sendSms = require('./send-sms.js');

async function routeMessage (message, peopleGroups) {
  const ids = extractIds(message.text);
  const peopleSet = peopleFromMixedIds(peopleGroups, ...ids);
  peopleSet.delete(message.sender);

  if (peopleSet.size) {
    const people = Array.from(peopleSet);
    await sendSms({
      to: people.map(p => p.number),
      message: `${message.sender.id} says:\n\n${message.text}`,
    });
    return true;
  } else {
    await sendSms({
      to: message.sender.number,
      message: squish`
        Oops, you must specify people/group recipients. For example:
        
        @someperson @somegroup yo where u at?
      `,
    });
    return true;
  }
}

module.exports = {
  routeMessage,
};
