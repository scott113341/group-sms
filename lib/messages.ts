import squish from "dedent-js";

import { peopleFromMixedIds, extractIds } from "./people.ts";
import type { PeopleGroups, Person } from "./people.ts";
import sendSms from "./send-sms.ts";

export type Message = {
  from: string;
  text: string;
  sender: Person;
};

export async function routeMessage(
  message: Message,
  peopleGroups: PeopleGroups,
): Promise<boolean> {
  const ids = extractIds(message.text);
  const peopleSet = peopleFromMixedIds(peopleGroups, ...ids);
  peopleSet.delete(message.sender);

  if (peopleSet.size) {
    const people = Array.from(peopleSet);
    await sendSms({
      to: people.map((p) => p.number),
      message: `${message.sender.id} says:\n\n${message.text}`,
    });
    return true;
  } else {
    await sendSms({
      to: message.sender.number,
      message: squish`
        Oops, you must specify people/group recipients. For example:
        
        @someperson @somegroup yo where u at?
      `,
    });
    return true;
  }
}
