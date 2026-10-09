import ccp from "chatcommand-parser";
import CCPArgument from "chatcommand-parser/lib/argument.js";
import * as z from "zod";

// Monkey-patch the chatcommand-parser library to be more permissive about the characters allowed. Specifically, we need
// a command like "/info @all" to have "@all" parsed as an argument. However the regex that ships with the library:
//   /.+?\b/
// does not match "@all" as we'd expect because "@" is a boundary character.
ccp.argument.word = (name) => new CCPArgument(name, /.+?(?!\w)/);

// The arguments each command parses into. Optional arguments that weren't given are null. Keep this in sync with the
// commands registered with the parser below: the args are strict objects, so a mismatch fails parsing (and the tests)
// instead of silently producing the wrong shape.
const command = <C extends string, S extends z.ZodRawShape>(name: C, args: S) =>
  z.object({ command: z.literal(name), args: z.strictObject(args) });

const ParsedCommandSchema = z.discriminatedUnion("command", [
  command("add", { groupId: z.string(), people: z.string() }),
  command("call", { ids: z.string() }),
  command("groups", {}),
  command("help", {}),
  command("info", { thing: z.string().nullable() }),
  command("invite", { number: z.string(), id: z.string(), name: z.string() }),
  command("join", { group: z.string() }),
  command("leave", { group: z.string() }),
  command("remove", { groupId: z.string(), people: z.string() }),
]);

type AnyParsedCommand = z.infer<typeof ParsedCommandSchema>;

export type CommandName = AnyParsedCommand["command"];

export type CommandArgs = {
  [C in CommandName]: Extract<AnyParsedCommand, { command: C }>["args"];
};

export type ParsedCommand<K extends CommandName = CommandName> = {
  [C in K]: { command: C; args: CommandArgs[C] };
}[K];

// Instantiate parser with "/" as the leading command character. Commands are added iteratively below.
const ccpParser = (() => {
  const parser = new ccp.Parser([], "/");

  const call = parser.addCommand("call");
  call.addArgument(ccp.argument.all("ids"));

  parser.addCommand("groups");

  parser.addCommand("help");

  const info = parser.addCommand("info");
  info.addArgument(ccp.argument.word("thing")).setRequired(false);

  const join = parser.addCommand("join");
  join.addArgument(ccp.argument.word("group")).setRequired(true);

  const leave = parser.addCommand("leave");
  leave.addArgument(ccp.argument.word("group")).setRequired(true);

  const invite = parser.addCommand("invite");
  invite.addArgument(ccp.argument.word("number")).setRequired(true);
  invite.addArgument(ccp.argument.word("id")).setRequired(true);
  invite.addArgument(ccp.argument.all("name")).setRequired(true);

  const add = parser.addCommand("add");
  add.addArgument(ccp.argument.word("groupId")).setRequired(true);
  add.addArgument(ccp.argument.all("people")).setRequired(true);

  const remove = parser.addCommand("remove");
  remove.addArgument(ccp.argument.word("groupId")).setRequired(true);
  remove.addArgument(ccp.argument.all("people")).setRequired(true);

  return parser;
})();

const parser = {
  parse(text: string): ParsedCommand | null {
    const result = ccpParser.parse(text);
    return result && ParsedCommandSchema.parse(result);
  },
};

export default parser;
