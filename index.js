const querystring = require('querystring');

const { routeCommand } = require('./lib/commands');
const { routeMessage } = require('./lib/messages');
const { loadPeople } = require('./lib/people.js');

async function bufferReq(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => resolve(querystring.parse(body)));
  });
}

module.exports = async (req, res) => {
  const peopleGroups = await loadPeople();
  const params = await bufferReq(req);

  const message = {
    from: params.From,
    text: params.Body.trim(),
    sender: peopleGroups.PEOPLE.findBy('number', params.From),
  };
  console.log(message);

  if (await routeCommand(message, peopleGroups)) {
    console.log('routed command');
  } else if (message.text[0] === '/') {
    console.log('invalid command');
  } else if (await routeMessage(message, peopleGroups)) {
    console.log('routed message');
  } else {
    console.log('errored');
  }

  res.setHeader('Content-Type', 'text/html');
  res.end('<Response></Response>');
};
