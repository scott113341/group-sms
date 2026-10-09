import { DatabaseError } from "pg";
import squish from "dedent-js";

import { loadPeople } from "../people.ts";
import withPgClient from "../pg-client.ts";
import sendSms from "../send-sms.ts";
import type { CommandContext } from "../commands.ts";
import type { CommandArgs } from "../parser.ts";

const BadNumberError = new Error();

export default async ({
  sender,
  peopleGroups,
  args,
}: CommandContext<CommandArgs["invite"]>) => {
  const { id, name, number } = args;

  try {
    let formattedNumber = formatNumber(number);

    await withPgClient((client) => {
      return client.query(
        `
        insert into people(id, name, number)
        values ($1, $2, $3)
        `,
        [id, name, formattedNumber],
      );
    });

    const peopleGroups = await loadPeople();
    const newPerson = peopleGroups.PEOPLE.findBy("id", id)!;

    await sendSms({
      to: newPerson.number,
      message: squish`
        Hi ${newPerson.name}, you've been invited to a Group SMS by ${sender.name}!
        
        To see the things you can do, text back your first command: /help
      `,
    });

    await sendSms({
      to: sender.number,
      message: squish`
        Successfully invited ${newPerson.id}:
        
        Name: ${newPerson.name}
        Phone: ${newPerson.number}
        Groups: ${newPerson.groups.map((g) => g.id).join(", ")}
      `,
    });
  } catch (e) {
    const constraint = e instanceof DatabaseError ? e.constraint : undefined;

    if (e === BadNumberError || constraint === "people_number_check") {
      return sendSms({
        to: sender.number,
        message: `Oops, the phone number "${number}" isn't valid`,
      });
    } else if (constraint === "people_pkey") {
      return sendSms({
        to: sender.number,
        message: `Oops, the id "${id}" is already in use`,
      });
    } else if (constraint === "people_id_check") {
      return sendSms({
        to: sender.number,
        message: `Oops, the id "${id}" isn't valid`,
      });
    } else if (constraint === "people_number_key") {
      return sendSms({
        to: sender.number,
        message: `Oops, the phone number "${number}" is already registered`,
      });
    } else {
      return sendSms({
        to: sender.number,
        message: `Oops, something went wrong`,
      });
    }
  }
};

function formatNumber(number: string): string {
  let fNumber = number;

  if (fNumber.match(/^\d{10}$/)) {
    fNumber = `+1${fNumber}`;
  } else if (fNumber.match(/^1\d{10}$/)) {
    fNumber = `+${fNumber}`;
  } else if (fNumber.match(/^\+1\d{10}$/)) {
    // Do nothing, already well-formatted
  } else {
    throw BadNumberError;
  }

  return fNumber;
}
