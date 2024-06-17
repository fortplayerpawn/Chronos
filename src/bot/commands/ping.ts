import type { CacheType, CommandInteraction } from "discord.js";
import BaseCommand from "../base/Base";

export default class PingCommand extends BaseCommand {
  data = {
    name: "ping",
    description: "Sends pong",
  };

  async execute(interaction: CommandInteraction<CacheType>): Promise<any> {
    await interaction.reply("the servers are breaking because you ran this");
  }
}
