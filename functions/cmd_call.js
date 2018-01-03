const Plivo = require('plivo');

const { extractIds, peopleFromMixedIds } = require('../lib/people.js');


/**
 * Command: /call
 * @param {string} from
 * @param {string} text
 * @param {object} sender
 * @param {object} args
 * @returns {any}
 */
module.exports = async (from, text, sender, args, context) => {
  const client = new Plivo.Client();

  const ids = extractIds(args.ids);

  if (ids.size) {
    ids.add(sender.id);

    const people = peopleFromMixedIds(...ids);

    const calls = Array.from(people).map(p => {
      console.log(`calling ${p.id}`);

      return client.calls.create(
        process.env.PLIVO_NUMBER,
        p.number,
        `https://scott113341.lib.id/hut-trip@dev/receive_call/`,
        {
          machineDetection: 'hangup',
        }
      );
    });

    return Promise.all(calls);
  }
};
