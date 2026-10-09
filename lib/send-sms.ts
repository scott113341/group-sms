import client from "./twilio-client.ts";

type SendSmsOptions = {
  from?: string;
  to: string | string[];
  message: string;
};

export default async ({
  from = "",
  to,
  message,
}: SendSmsOptions): Promise<string[]> => {
  from = from || process.env.TWILIO_NUMBER!;
  const numbers = Array.isArray(to) ? to : [to];

  const promises = numbers.map(async (number) => {
    const args = {
      body: message,
      to: number,
      from: from,
    };

    if (process.env.SEND_SMS === "true") {
      await client.messages.create(args);
      return "sent message";
    } else {
      return "skipping message send because SEND_SMS !== true";
    }
  });

  return Promise.all(promises);
};
