const test = require('tape');

const parser = require('../lib/parser');

test('/join @drivers', t => {
  const cmd = parser.parse(`/join @drivers`);
  t.deepEqual(cmd, {
    command: 'join',
    args: {
      group: '@drivers',
    },
  });
  t.end();
});
