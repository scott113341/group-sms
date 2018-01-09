const ccp = require('chatcommand-parser');
const CCPArgument = require('chatcommand-parser/lib/argument.js');
const lib = require('lib');

const cmdCall = require('../lib/commands/call.js');
const cmdGroups = require('../lib/commands/groups.js');
const cmdHelp = require('../lib/commands/help.js');
const cmdInfo = require('../lib/commands/info.js');
const cmdJoin = require('../lib/commands/join.js');
const cmdLeave = require('../lib/commands/leave.js');


// Monkey-patch library
ccp.argument.word = (name) => new CCPArgument(name, /.+?(?!\w)/);

// Make parser
const p = new ccp.Parser([], '/');

p.addCommand('call');
p['call'].addArgument(ccp.argument.all('ids'));

p.addCommand('groups');

p.addCommand('help');

p.addCommand('info');
p['info'].addArgument(ccp.argument.word('thing')).setRequired(false);

p.addCommand('join');
p['join'].addArgument(ccp.argument.all('group')).setRequired(true);

p.addCommand('leave');
p['leave'].addArgument(ccp.argument.all('group')).setRequired(true);


async function routeCommand (message, context) {
  const cmd = parseCommand(message.text);
  if (!cmd) return false;

  console.log(cmd);

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
    await command({ ...message, args: cmd.args, context });
    return true;
  } else {
    return false;
  }
}


function parseCommand (text) {
  return p.parse(text);
}


module.exports = {
  parser: p,
  routeCommand,
  parseCommand,
};
