// chatcommand-parser doesn't ship type definitions, so these cover the subset of its API that we use.

declare module "chatcommand-parser/lib/argument.js" {
  class Argument {
    constructor(name: string, regex?: RegExp);
    setRequired(required: boolean): this;
  }
  export = Argument;
}

declare module "chatcommand-parser" {
  import Argument = require("chatcommand-parser/lib/argument.js");

  class Command {
    addArgument(argument: Argument | string): Argument;
  }

  class Parser {
    constructor(commands: unknown[], prefix?: string);
    addCommand(name: string): Command;
    parse(
      text: string,
    ): { command: string; args: Record<string, string | null> } | null;
  }

  const ccp: {
    Parser: typeof Parser;
    argument: {
      word: (name: string) => Argument;
      int: (name: string) => Argument;
      all: (name: string) => Argument;
    };
  };
  export = ccp;
}
