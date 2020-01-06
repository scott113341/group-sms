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

test('/invite 1234567890 @scott Scott Hardy', t => {
  const cmd = parser.parse(`/invite 1234567890 @scott Scott Hardy`);
  t.deepEqual(cmd, {
    command: 'invite',
    args: {
      number: '1234567890',
      id: '@scott',
      name: 'Scott Hardy',
    },
  });
  t.end();
});

test('/add @drivers @scott @rico', t => {
  const cmd = parser.parse(`/add @drivers @scott @rico`);
  t.deepEqual(cmd, {
    command: 'add',
    args: {
      groupId: '@drivers',
      people: '@scott @rico',
    },
  });
  t.end();
});
