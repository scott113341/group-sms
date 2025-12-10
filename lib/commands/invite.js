import squish from "dedent-js";

import { loadPeople } from "../people.js";
import withPgClient from "../pg-client.js";
import sendSms from "../send-sms.js";

const BadNumberError = new Error();

export default async ({ from, text, sender, peopleGroups, args }) => {
  const { id, name, number } = args;

  try {
    let formattedNumber = formatNumber(number);

    await withPgClient((client) => {
      return client.query(
        `
        insert into people(id, name, number)
        values ($1, $2, $3)
        `,
        [id, name, formattedNumber]
      );
    });

    const peopleGroups = await loadPeople();
    const newPerson = peopleGroups.PEOPLE.findBy("id", id);

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
    if (e === BadNumberError || e.constraint === "people_number_check") {
      return sendSms({
        to: sender.number,
        message: `Oops, the phone number "${number}" isn't valid`,
      });
    } else if (e.constraint === "people_pkey") {
      return sendSms({
        to: sender.number,
        message: `Oops, the id "${id}" is already in use`,
      });
    } else if (e.constraint === "people_id_check") {
      return sendSms({
        to: sender.number,
        message: `Oops, the id "${id}" isn't valid`,
      });
    } else if (e.constraint === "people_number_key") {
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

function formatNumber(number) {
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
