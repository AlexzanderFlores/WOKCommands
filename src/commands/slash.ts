import { MessageEmbed } from "discord.js";
import ICommandArguments from "../interfaces/ICommandArguments";

export = {
  maxArgs: 3,
  expectedArgs: '["delete"] [command ID]',
  ownerOnly: true,
  description: "Allows the bot developers to manage existing slash commands",
  category: "Development",
  hidden: true,
  callback: async (options: ICommandArguments) => {
    const { channel, instance, args } = options;

    const { guild } = channel;
    const { slashCommands } = instance;

    const global = await slashCommands.get();

    if (args.length && args[0] === "delete") {
      const targetCommand = args[1];
      if (!targetCommand) {
        channel.send("Please specify a command ID");
        return;
      }

      const useGuild =
        global.filter((cmd) => cmd.id === targetCommand).length === 0;

      slashCommands.delete(targetCommand, useGuild ? guild.id : undefined);

      if (useGuild) {
        channel.send(
          `Slash command with the ID "${targetCommand}" has been deleted from guild "${guild.id}"`
        );
      } else {
        channel.send(
          `Slash command with the ID "${targetCommand}" has been deleted. This may take up to 1 hour to be seen on all servers using your bot..`
        );
      }
      return;
    }

    const embed = new MessageEmbed()
      .addField(
        "How to delete a slash command:",
        `_${instance.getPrefix(guild)}slash delete <command ID>`
      )
      .addField(
        "List of global slash commands:",
        global.length ? global.map((cmd) => `${cmd.name}: ${cmd.id}`) : "None"
      );

    if (guild) {
      const guildOnly = await slashCommands.get(guild.id);

      embed.addField(
        `List of slash commands for "${guild.name}" only`,
        guildOnly.length
          ? guildOnly.map((cmd) => ` ${cmd.name}: ${cmd.id}`)
          : "None"
      );
    }

    embed.setColor(instance.color);

    channel.send("", { embed });
  },
};
