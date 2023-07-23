const test = require("tape");

const { extractIds } = require("../lib/people");

test("extractIds", (t) => {
  t.deepEqual(extractIds("@all Hi"), new Set(["@all"]));
  t.deepEqual(extractIds("@a @b Hi"), new Set(["@a", "@b"]));
  t.deepEqual(extractIds("@all\nHi"), new Set(["@all"]));
  t.end();
});
