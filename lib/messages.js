const squish = require('dedent-js');
const lib = require('lib');

const { loadPeople, peopleFromMixedIds, extractIds } = require('./people.js');


async function routeMessage (message, context) {
  const peopleGroups = await loadPeople();

  const ids = extractIds(message.text);
  const peopleSet = peopleFromMixedIds(peopleGroups, ...ids);
  peopleSet.delete(message.sender);

  if (peopleSet.size) {
    const people = Array.from(peopleSet);
    await lib[`${context.service.identifier}.send_sms`]({
      to: people.map(p => p.number),
      message: `${message.sender.id} says:\n\n${message.text}`,
    });
    return true;
  } else {
    await lib[`${context.service.identifier}.send_sms`]({
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
