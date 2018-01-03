const ccp = require('chatcommand-parser');
const CCPArgument = require('chatcommand-parser/lib/argument.js');
const lib = require('lib');


// Monkey-patch library
ccp.argument.word = (name) => new CCPArgument(name, /.+?(?!\w)/);

// Make parser
const p = new ccp.Parser([], '/');

// help
p.addCommand('help');

// members
p.addCommand('members');
p['members'].addArgument(ccp.argument.word('group')).setRequired(false);

// groups
p.addCommand('groups');

// call
p.addCommand('call');
p['call'].addArgument(ccp.argument.all('ids'));


async function routeCommand (message, context) {
  const cmd = parseCommand(message.text);
  if (!cmd) return false;

  console.log(cmd);

  const commands = {
    'help': 'cmd_help',
    'members': 'cmd_members',
    'groups': 'cmd_groups',
    'call': 'cmd_call',
  };
  const name = commands[cmd.command];

  if (name) {
    await lib[`${context.service.identifier}.${name}`]({ ...message, args: cmd.args });
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
