const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class dogCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["puppy", "randomdog"],
      description: "Posts a random dog picture.",
      cooldown: 3,
    });
  }

  async run(msg) {
    // Fetches the API
    let res = await fetch("https://dog.ceo/api/breeds/image/random");
    let body = await res.json().catch(() => {});

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: "🐶 Woof!",
        image: {
          url: body.message,
        },
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = dogCommand;