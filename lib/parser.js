const ccp = require('chatcommand-parser');
const CCPArgument = require('chatcommand-parser/lib/argument.js');

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

module.exports = parser;
