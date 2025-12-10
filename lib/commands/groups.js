import squish from "dedent-js";

import sendSms from "../send-sms.js";

export default async ({ from, text, sender, peopleGroups, args }) => {
  const { GROUPS } = peopleGroups;

  await sendSms({
    to: sender.number,
    message: squish`
      Here's all the groups:
      
      ${GROUPS.all.map((g) => g.id).join("\n")}
    `,
  });
};
