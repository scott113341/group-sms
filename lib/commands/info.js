const squish = require("dedent-js");

const sendSms = require("../send-sms.js");

module.exports = async ({ from, text, sender, peopleGroups, args }) => {
  const { PEOPLE, GROUPS } = peopleGroups;

  const message = (() => {
    if (args.thing) {
      const id = args.thing.replace(/^([^@])/, "@$1");
      const person = PEOPLE.findBy("id", id);
      const group = GROUPS.findBy("id", id);

      if (person) return personInfo(person);
      else if (group) return groupInfo(group);
      else return oops(id);
    } else {
      return selfInfo();
    }
  })();

  return sendSms({
    to: sender.number,
    message: message,
  });

  /*
   * Responses
   */

  function selfInfo() {
    return squish`
      Hi ${sender.id}, here is your info:
      
      Name: ${sender.name}
      Phone: ${sender.number}
      Groups: ${sender.groups.map((g) => g.id).join(", ")}
    `;
  }

  function personInfo(person) {
    return squish`
      Here is ${person.id}'s info:
      
      Name: ${person.name}
      Phone: ${person.number}
      Groups: ${person.groups.map((g) => g.id).join(", ")}
    `;
  }

  function groupInfo(group) {
    const names = group.people
      .map((p) => `${p.id} - ${p.name} ${p.number}`)
      .join("\n");

    return squish`
      Here's everyone in the ${group.id} group:
      
      ${names}
    `;
  }

  function oops(id) {
    return `Oops, couldn't find any people or groups named "${id}"`;
  }
};
