# Group SMS

This application provides group SMS messaging. It is useful for group coordination where internet connectivity is unreliable or low-bandwidth. It was developed for coordination of backpacking trips in the mountains of Colorado. It is inspired by IRC and [GroupMe](https://groupme.com/en-US/sms).

## Functionality

To describe the functionality, we'll use a few special words:

- `@person` means a person's nickname. For example: `@scott` or `@rico`
- `@group` means a group's name. For example: `@all` or `@drivers`
- `@thing` means _either_ a `@person` or a `@group`

### Messages

To send a message, simply specify one or more `@thing`s, followed by your message. It will be delivered to those recipients.

- Example direct message: `@scott where are you?`
- Example group message: `@all did anyone find my boots?`
- Example mixed message: `@scott @drivers @rico do you know where we're meeting?`

### Commands

- All commands start with a slash: `/`
- Some commands can only act on a person (`@person`), some can only act on a group (`@group`), and some can act on either (`@thing`).
- Some commands take optional arguments, denoted inside `[]`
- Some commands can take multiple arguments, denoted with `argument, ...`

For example, to use `/call`, you must specify at least one `@thing` to call (a person or a group). Additionally, you can optionally specify multiple other `@thing`s to include on the call. So, you could write `/call @scott`, or `/call @scott @rico` or `/call @scott @drivers @rico`.

#### `/call @thing [@thing, ...]`

All of the specified `@things` (people, and people in those groups) will have their phones ring simultaneously and be launched into a conference call. To initiate complete chaos, try `/call @all`.

#### `/info [@thing]`

If you don't give any arguments (aka, you send `/info`), this displays information about you. If you specify a `@thing`, it'll return information about that group or person. Doing a quick `/info @all` is a nice way to get everyone's name + phone number stored offline in your phone as a text message.

#### `/invite 1234567890 @scott Scott Hardy`

Invites a user to the group.

#### `/groups`

Lists all groups

#### `/join @group`

Join the specified `@group`. If it doesn't exist yet, it'll be created!

#### `/leave @group`

Leave the specified `@group`.

#### `/add @group @person [@person, ...]`

Adds the `@person` to the specified `@group`.

#### `/remove @group @person [@person, ...]`

Removes the `@person` from the specified `@group`.

#### `/help`

Displays a message about how to use Group SMS.

## Adding a command

- In `lib/parser.js`, use `#addCommand` to register the command with the parser
- In `lib/commands/`, create a new file with the handler to be invoked
- In `lib/commands.js`, add a key-value pair to map the command name with its newly-created handler
- In `lib/commands/help.js`, document the command
- In `README.md`, document the command
