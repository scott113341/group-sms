const withPgClient = require('./pg-client.js');


/*
 * People and Groups classes and singletons
 */
class Things {
  constructor () {
    this._things = new Set();
  }

  get all () {
    return Array.from(this._things.values());
  }

  add (...things) {
    things.forEach(thing => this._things.add(thing));
  }

  where (key, value) {
    return this.all.filter(t => t[key] === value);
  }

  findBy (key, value) {
    return this.all.find(t => t[key] === value);
  }
}

class People extends Things {}
class Groups extends Things {}


/*
 * Person and Group classes
 */
class Person {
  constructor ({ id, name, number }) {
    Object.assign(this, { id, name, number });
    this._groups = new Set();
  }

  get groups () {
    return Array.from(this._groups.values());
  }
}

class Group {
  constructor ({ id, members = [] }) {
    Object.assign(this, { id });
    this._people = new Set();
    members.forEach(p => this.add(p));
  }

  get people () {
    return Array.from(this._people.values());
  }

  add (person) {
    this._people.add(person);
    person._groups.add(this);
  }
}


/*
 * Helper methods
 */
function peopleFromMixedIds ({ PEOPLE, GROUPS }, ...ids) {
  const people = new Set();

  ids.forEach(id => {
    const person = PEOPLE.findBy('id', id);
    if (person) {
      people.add(person);
      return;
    }

    const group = GROUPS.findBy('id', id);
    if (group) {
      group.people.forEach(p => people.add(p));
    }
  });

  return people;
}

function extractIds (string) {
  const ids = new Set();
  const pieces = string.split(' ');
  while (pieces[0] && pieces[0][0] === '@') {
    const id = pieces.shift().replace(/[,.:;'"?/]*$/, '');
    ids.add(id);
  }
  return ids;
}


/*
 * Loading function
 */
async function loadPeople () {
  const PEOPLE = new People();
  const GROUPS = new Groups();

  const [ people, groupIds, groups ] = await withPgClient((client) => {
    return Promise.all([
      client.query(`select * from people`),
      client.query(`select distinct group_id from groups`),
      client.query(`select * from groups`),
    ]);
  });

  // Make people
  people.rows.forEach(({ id, name, number }) => {
    const person = new Person({ id, name, number });
    PEOPLE.add(person);
  });

  // Make groups
  groupIds.rows.forEach(({ group_id }) => {
    const group = new Group({ id: group_id });
    GROUPS.add(group);
  });

  // Add people to groups
  groups.rows.forEach(({ group_id, person_id }) => {
    const group = GROUPS.findBy('id', group_id);
    group.add(PEOPLE.findBy('id', person_id));
  });

  return { PEOPLE, GROUPS };
}


module.exports = {
  peopleFromMixedIds,
  extractIds,
  loadPeople,
};
