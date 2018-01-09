const lib = require('lib');

const { loadPeople, peopleFromMixedIds, extractIds } = require('./people.js');


async function routeMessage (message, context) {
  const peopleGroups = await loadPeople();

  const ids = extractIds(message.text);
  const peopleSet = ids.size
    ? peopleFromMixedIds(peopleGroups, ...ids)
    : peopleFromMixedIds(peopleGroups, '@all');
  peopleSet.delete(message.sender);

  if (peopleSet.size) {
    const people = Array.from(peopleSet);
    await lib[`${context.service.identifier}.send_sms`]({
      to:people.map(p => p.number),
      message: `${message.sender.id} says:\n\n${message.text}`,
    });
    return true;
  } else {
    return false;
  }
}

module.exports = {
  routeMessage,
};
