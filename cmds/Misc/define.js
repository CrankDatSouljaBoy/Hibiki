const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class defineCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["defineword", "dict", "dictionary"],
      args: "<word:string>",
      description: "Gives a definition from the Merriam-Webster dictionary.",
      requiredkeys: ["dictionary"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const body = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(args.join(" "))}?key=${this.bot.key.dictionary}`)
      .then(async res => await res.json().catch(() => {}));

    if (!body || !body[0] || !body[0].meta) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No definition found.", "error"));
    }

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `📕 Definition for ${args.join(" ")}`,
        color: this.bot.embed.color("general"),
        fields: [{
          name: "Category",
          value: `${body[0].fl || "No category"}`,
          inline: true,
        }, {
          name: "Stems",
          value: `${body[0].meta !== undefined || body[0].meta.stems ? body[0].meta.stems.join(", ") : "None"}`,
          inline: true,
        }, {
          name: "Definition",
          value: `${body[0].shortdef[0] || "No definition"}`,
          inline: false,
        }],
      },
    });
  }
}

module.exports = defineCommand;