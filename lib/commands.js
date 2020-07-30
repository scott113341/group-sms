const cmdAdd = require("../lib/commands/add");
const cmdCall = require("../lib/commands/call");
const cmdGroups = require("../lib/commands/groups");
const cmdHelp = require("../lib/commands/help");
const cmdInfo = require("../lib/commands/info");
const cmdInvite = require("../lib/commands/invite");
const cmdJoin = require("../lib/commands/join");
const cmdLeave = require("../lib/commands/leave");
const cmdRemove = require("../lib/commands/remove");
const parser = require("../lib/parser");

async function routeCommand(message, peopleGroups) {
  const cmd = parseCommand(message.text);
  if (!cmd) return false;

  const commands = {
    add: cmdAdd,
    call: cmdCall,
    groups: cmdGroups,
    help: cmdHelp,
    info: cmdInfo,
    invite: cmdInvite,
    join: cmdJoin,
    leave: cmdLeave,
    remove: cmdRemove,
  };
  const command = commands[cmd.command];

  if (command) {
    await command({ ...message, peopleGroups, args: cmd.args });
    return true;
  } else {
    return false;
  }
}

function parseCommand(text) {
  return parser.parse(text);
}

module.exports = {
  routeCommand,
  parseCommand,
};
