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
const PEOPLE = new People();
const GROUPS = new Groups();

class Person {
  constructor ({ id, name, number }) {
    Object.assign(this, { id, name, number });
    this._groups = new Set();
    PEOPLE.add(this);
  }

  get groups () {
    return Array.from(this._groups.values());
  }
}

class Group {
  constructor ({ id, members }) {
    Object.assign(this, { id });
    this._people = new Set();
    members.forEach(p => this.add(p));
    GROUPS.add(this);
  }

  get people () {
    return Array.from(this._people.values());
  }

  add (person) {
    this._people.add(person);
    person._groups.add(this);
  }
}

function peopleFromMixedIds (...ids) {
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
    ids.add(pieces.shift());
  }
  return ids;
}


/*
 * PEOPLE
 */
process.env.PEOPLE.split(',').forEach(line => {
  const [ id, name, number ] = line.split('|');
  new Person({ id, name, number });
});


/*
 * GROUPS
 */
new Group({
  id: '@all',
  members: [ ...PEOPLE.all ]
});

process.env.GROUPS.split(',').forEach(line => {
  const [ id, ...personIds ] = line.split('|');
  const members = personIds.map(personId => PEOPLE.findBy('id', personId));
  new Group({ id, members });
});


module.exports = {
  PEOPLE,
  GROUPS,
  peopleFromMixedIds,
  extractIds,
};
