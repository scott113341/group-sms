const ccp = require('chatcommand-parser');
const CCPArgument = require('chatcommand-parser/lib/argument.js');

const cmdCall = require('../lib/commands/call.js');
const cmdGroups = require('../lib/commands/groups.js');
const cmdHelp = require('../lib/commands/help.js');
const cmdInfo = require('../lib/commands/info.js');
const cmdJoin = require('../lib/commands/join.js');
const cmdLeave = require('../lib/commands/leave.js');

// Monkey-patch the chatcommand-parser library to be more permissive about the characters allowed. Specifically, we need
// a command like "/info @all" to have "@all" parsed as an argument. However the regex that ships with the library:
//   /.+?\b/
// does not match "@all" as we'd expect because "@" is a boundary character.
ccp.argument.word = (name) => new CCPArgument(name, /.+?(?!\w)/);

// Instantiate parser with "/" as the leading command character. Commands are added iteratively below.
const parser = (() => {
  const parser = new ccp.Parser([], '/');

  parser.addCommand('call');
  parser['call'].addArgument(ccp.argument.all('ids'));

  parser.addCommand('groups');

  parser.addCommand('help');

  parser.addCommand('info');
  parser['info'].addArgument(ccp.argument.word('thing')).setRequired(false);

  parser.addCommand('join');
  parser['join'].addArgument(ccp.argument.word('group')).setRequired(true);

  parser.addCommand('leave');
  parser['leave'].addArgument(ccp.argument.word('group')).setRequired(true);

  return parser;
})();

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
  parser,
  routeCommand,
  parseCommand,
};
