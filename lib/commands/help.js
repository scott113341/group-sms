const squish = require('dedent-js');

const sendSms = require('../send-sms.js');

module.exports = async ({ from, text, sender, peopleGroups, args }) => {
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
      
      /help
      Returns this message
    `,
  });
};
