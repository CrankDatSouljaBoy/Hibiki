const Command = require("../../lib/structures/Command");

function ilovepenis(argString, delimiter) {
  let argObj = [];
  // Sets each arg
  argString.split(delimiter).forEach(arg => {
    // Hibiki, powered by unreliable regexes
    let r = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
    if (!r) return;
    argObj.push({
      name: r[2],
      type: r[3],
      flag: r[4],
      // Optional args are in []
      optional: r[1] === "[",
    });
  });
  return argObj.map(ilovecum => `${ilovecum.optional ? "[" : "<"}${ilovecum.name}${ilovecum.optional ? "]" : ">"}`).join(delimiter);
}

class helpCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[command:string]",
      aliases: ["commands", "listcmds", "listcommands"],
      description: "Sends a list of commands or info about a specific command.",
      allowdisable: false,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Prettier categories
    function categoryEmoji(category) {
      let label;
      switch (category) {
        case "Core":
          label = "🤖 Core";
          break;
        case "Fun":
          label = "🎉 Fun";
          break;
        case "Images":
          label = "🖼 Images";
          break;
        case "Misc":
          label = "❓ Misc";
          break;
        case "Moderation":
          label = "🔨 Moderation";
          break;
        case "NSFW":
          label = "🔞 NSFW";
          break;
        case "Roleplay":
          label = "️️️❤️ Roleplay";
          break;
        case "Owner":
          label = "⛔ Owner";
          break;
        default:
          label = "Unknown";
          break;
      }
      return label;
    }
    // Finds the cmd
    let cmd;
    if (args) cmd = this.bot.commands.find(c => c.id.toLowerCase() === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()));
    // If cmd not found
    if (!cmd) {
      let db = undefined;
      if (msg.channel.type !== "1") db = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
      let categories = [];
      // Removes owner commands
      this.bot.commands.forEach(c => { if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category); });
      // Hides disabled categories/cmds
      if (db && db.disabledCategories) categories = categories.filter(c => !db.disabledCategories.includes(c));
      let sortedcategories = [];
      let owneramt = 0;
      this.bot.commands.forEach(c => c.category === "Owner" ? owneramt++ : null);
      // Sorts the categories
      categories = categories.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Sets category labels
      categories.forEach(e => { sortedcategories[categories.indexOf(e)] = categoryEmoji(e); });
      // Lets users run help here to get help in the channel
      if (args && args.join(" ").toLowerCase() === "here") {
        // Sends the embed
        return msg.channel.createMessage({
          embed: {
            color: this.bot.embed.colour("general"),
            fields: categories.map(category => ({
              name: sortedcategories[categories.indexOf(category)],
              // Hides disabled commands
              value: this.bot.commands.map(c => {
                if (db !== undefined && db.disabledCmds !== undefined && db.disabledCmds.includes(c.id)) return;
                if (c.category !== category) return;
                return `\`${c.id}\``;
              }).join(" "),
            })),
          },
        });
      }

      // Gets author's DM channel
      let DMChannel = await msg.author.getDMChannel();
      let dmson = await DMChannel.createMessage({
        embed: {
          color: this.bot.embed.colour("general"),
          fields: categories.map(category => ({
            name: sortedcategories[categories.indexOf(category)],
            // Hides disabled commands
            value: this.bot.commands.map(c => {
              if (db !== undefined && db.disabledCmds !== undefined && db.disabledCmds.includes(c.id)) return;
              if (c.category !== category) return;
              return `\`${c.id}\``;
            }).join(" "),
          })),
        },
      }).catch(() => {
        // Sends the help command in the channel if the DM failed
        return msg.channel.createMessage({
          embed: {
            color: this.bot.embed.colour("general"),
            fields: categories.map(category => ({
              name: sortedcategories[categories.indexOf(category)],
              value: this.bot.commands.map(c => {
                if (c.category !== category) return;
                return `\`${c.id}\``;
              }).join(" "),
            })),
          },
        });
      });
      // Sends confirmation message
      if (dmson !== undefined) msg.channel.createMessage(this.bot.embed("📚 Help", "Check your DMs for a list of commands.", "general"));
    } else {
      let construct = [];
      // Hides owner cmdss
      if (cmd.category === "Owner") return;
      // Sets the fields
      if (cmd.aliases) construct.push({ name: "Aliases", value: `${cmd.aliases.map(alias => `\`${alias}\``).join(" ") || "No aliases"}`, inline: false, });
      if (cmd.args) construct.push({ name: "Usage", value: ilovepenis(cmd.args), inline: false, });
      if (cmd.category) construct.push({ name: "Category", value: cmd.category, inline: true });
      if (cmd.cooldown) construct.push({ name: "Cooldown", value: `${cmd.cooldown} seconds`, inline: true, });
      if (cmd.clientperms) construct.push({ name: "Bot Permissions", value: cmd.clientperms, inline: true, });
      if (cmd.requiredperms) construct.push({ name: "User Permissions", value: cmd.requiredperms, inline: true, });
      msg.channel.createMessage({
        embed: {
          title: `✨ ${cmd.id}`,
          description: cmd.description,
          color: this.bot.embed.colour("general"),
          fields: construct,
        },
      })
    }
  }
}


module.exports = helpCommand;