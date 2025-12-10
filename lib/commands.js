import cmdAdd from "./commands/add.js";
import cmdCall from "./commands/call.js";
import cmdGroups from "./commands/groups.js";
import cmdHelp from "./commands/help.js";
import cmdInfo from "./commands/info.js";
import cmdInvite from "./commands/invite.js";
import cmdJoin from "./commands/join.js";
import cmdLeave from "./commands/leave.js";
import cmdRemove from "./commands/remove.js";
import parser from "./parser.js";

export async function routeCommand(message, peopleGroups) {
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

export function parseCommand(text) {
  return parser.parse(text);
}
