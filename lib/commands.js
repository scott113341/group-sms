const cmdCall = require('../lib/commands/call.js');
const cmdGroups = require('../lib/commands/groups.js');
const cmdHelp = require('../lib/commands/help.js');
const cmdInfo = require('../lib/commands/info.js');
const cmdJoin = require('../lib/commands/join.js');
const cmdLeave = require('../lib/commands/leave.js');
const parser = require('../lib/parser');

async function routeCommand (message, peopleGroups) {
  const cmd = parseCommand(message.text);
  if (!cmd) return false;

  const commands = {
    'call': cmdCall,
    'groups': cmdGroups,
    'help': cmdHelp,
    'info': cmdInfo,
    'join': cmdJoin,
    'leave': cmdLeave,
  };
  const command = commands[cmd.command];

  if (command) {
    await command({ ...message, peopleGroups, args: cmd.args });
    return true;
  } else {
    return false;
  }
}

function parseCommand (text) {
  return parser.parse(text);
}

module.exports = {
  routeCommand,
  parseCommand,
};
