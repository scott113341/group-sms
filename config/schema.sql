------------
-- PEOPLE --
------------
CREATE TABLE people (
    id character varying(32) PRIMARY KEY CHECK (id::text ~ '^@[a-z0-9_]+$'::text),
    name text NOT NULL,
    number text NOT NULL
);

CREATE UNIQUE INDEX people_pkey ON people(id text_ops);

------------
-- GROUPS --
------------
CREATE TABLE groups (
    group_id character varying(32) NOT NULL CHECK (group_id::text ~ '^@[a-z0-9_]+$'::text),
    person_id character varying(32) NOT NULL REFERENCES people(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX groups_group_id_person_id_key ON groups(group_id text_ops, person_id text_ops);
