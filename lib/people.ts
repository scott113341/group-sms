import * as z from "zod";

import withPgClient, { queryRows } from "./pg-client.ts";

/*
 * People and Groups classes and singletons
 */
class Things<T> {
  _things = new Set<T>();

  get all(): T[] {
    return Array.from(this._things.values());
  }

  add(...things: T[]) {
    things.forEach((thing) => this._things.add(thing));
  }

  where<K extends keyof T>(key: K, value: T[K]): T[] {
    return this.all.filter((t) => t[key] === value);
  }

  findBy<K extends keyof T>(key: K, value: T[K]): T | undefined {
    return this.all.find((t) => t[key] === value);
  }
}

class People extends Things<Person> {}
class Groups extends Things<Group> {}

export type PeopleGroups = {
  PEOPLE: People;
  GROUPS: Groups;
};

/*
 * Person and Group classes
 */
export class Person {
  id: string;
  name: string;
  number: string;
  _groups = new Set<Group>();

  constructor({
    id,
    name,
    number,
  }: {
    id: string;
    name: string;
    number: string;
  }) {
    this.id = id;
    this.name = name;
    this.number = number;
  }

  get groups(): Group[] {
    return Array.from(this._groups.values());
  }
}

export class Group {
  id: string;
  _people = new Set<Person>();

  constructor({ id, members = [] }: { id: string; members?: Person[] }) {
    this.id = id;
    members.forEach((p) => this.add(p));
  }

  get people(): Person[] {
    return Array.from(this._people.values());
  }

  add(person: Person) {
    this._people.add(person);
    person._groups.add(this);
  }
}

/*
 * Helper methods
 */
export function peopleFromMixedIds(
  { PEOPLE, GROUPS }: PeopleGroups,
  ...ids: string[]
): Set<Person> {
  const people = new Set<Person>();

  ids.forEach((id) => {
    const person = PEOPLE.findBy("id", id);
    if (person) {
      people.add(person);
      return;
    }

    const group = GROUPS.findBy("id", id);
    if (group) {
      group.people.forEach((p) => people.add(p));
    }
  });

  return people;
}

export function extractIds(string: string): Set<string> {
  const ids = new Set<string>();
  const pieces = string.split(/\s+/);
  while (pieces[0] && pieces[0][0] === "@") {
    const id = pieces.shift()!.replace(/[,.:;'"?/]*$/, "");
    ids.add(id);
  }
  return ids;
}

/*
 * Loading function
 */
const PersonRow = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
});

const GroupMembershipRow = z.object({
  group_id: z.string(),
  person_id: z.string(),
});

export async function loadPeople(): Promise<PeopleGroups> {
  const PEOPLE = new People();
  const GROUPS = new Groups();

  const [people, groupIds, groups] = await withPgClient((client) => {
    return Promise.all([
      queryRows(client, PersonRow, `select * from people`),
      queryRows(
        client,
        z.object({ group_id: z.string() }),
        `select distinct group_id from groups`,
      ),
      queryRows(client, GroupMembershipRow, `select * from groups`),
    ]);
  });

  // Make people
  people.forEach(({ id, name, number }) => {
    const person = new Person({ id, name, number });
    PEOPLE.add(person);
  });

  // Make groups
  groupIds.forEach(({ group_id }) => {
    const group = new Group({ id: group_id });
    GROUPS.add(group);
  });

  // Add people to groups
  groups.forEach(({ group_id, person_id }) => {
    const group = GROUPS.findBy("id", group_id)!;
    group.add(PEOPLE.findBy("id", person_id)!);
  });

  return { PEOPLE, GROUPS };
}
