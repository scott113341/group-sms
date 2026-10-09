import cmdAdd from "./commands/add.ts";
import cmdCall from "./commands/call.ts";
import cmdGroups from "./commands/groups.ts";
import cmdHelp from "./commands/help.ts";
import cmdInfo from "./commands/info.ts";
import cmdInvite from "./commands/invite.ts";
import cmdJoin from "./commands/join.ts";
import cmdLeave from "./commands/leave.ts";
import cmdRemove from "./commands/remove.ts";
import type { Message } from "./messages.ts";
import parser, {
  type CommandArgs,
  type CommandName,
  type ParsedCommand,
} from "./parser.ts";
import type { PeopleGroups } from "./people.ts";

export type CommandContext<A> = Message & {
  peopleGroups: PeopleGroups;
  args: A;
};

type CommandHandler<A> = (ctx: CommandContext<A>) => Promise<unknown>;

const commands: { [C in CommandName]: CommandHandler<CommandArgs[C]> } = {
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

export async function routeCommand(
  message: Message,
  peopleGroups: PeopleGroups,
): Promise<boolean> {
  const cmd = parseCommand(message.text);
  if (!cmd) return false;

  await runCommand(cmd, message, peopleGroups);
  return true;
}

async function runCommand<C extends CommandName>(
  cmd: ParsedCommand<C>,
  message: Message,
  peopleGroups: PeopleGroups,
) {
  const command: CommandHandler<CommandArgs[C]> = commands[cmd.command];
  await command({ ...message, peopleGroups, args: cmd.args });
}

export function parseCommand(text: string): ParsedCommand | null {
  return parser.parse(text);
}
