import squish from "dedent-js";

import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["help"]>) => {
  await sendSms({
    to: sender.number,
    message: squish`
      These are the things you can do:
      
      @someperson @somegroup yo where u at?
      Sends a message to people/groups listed
      
      /info
      No arguments: info about you
      @someperson: info about the person
      @somegroup: members in the group
      
      /groups
      Lists all groups
      
      /join @somegroup
      Join a group (creates if doesn't exist)
      
      /leave @somegroup
      Leave a group
      
      /call @someperson @somegroup
      Starts a conference call with people/groups listed
      
      /invite 1234567890 @scott Scott Hardy
      Invites a new person to the group
      
      /add @somegroup @someperson @otherperson
      Add people to a group
      
      /remove @somegroup @someperson @otherperson
      Remove people from a group
      
      /help
      Returns this message
    `,
  });
};
