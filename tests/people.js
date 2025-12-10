import test from "tape";

import { extractIds } from "../lib/people.js";

test("extractIds", (t) => {
  t.deepEqual(extractIds("@all Hi"), new Set(["@all"]));
  t.deepEqual(extractIds("@a @b Hi"), new Set(["@a", "@b"]));
  t.deepEqual(extractIds("@all\nHi"), new Set(["@all"]));
  t.end();
});
