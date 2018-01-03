const Plivo = require('plivo');


/**
 * Returns Plivo XML to start/join a conference call.
 * @returns {any}
 */
module.exports = (context, callback) => {
  const res = new Plivo.Response();
  res.addSpeak('Connecting');
  res.addConference('conf', { enterSound : 'beep:1' });

  callback(null, new Buffer(res.toXML()), { 'Content-Type': 'text/xml' });
};
