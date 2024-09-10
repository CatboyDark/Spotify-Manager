import Command from '../Private/Command';
import DiscordManager from '../DiscordManager';
import Playback from '../../Spotify/Private/API/Playback';
import {
  ApplicationIntegrationType,
  BaseMessageOptions,
  ButtonInteraction,
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder
} from 'discord.js';

class PreviousCommand extends Command {
  data: SlashCommandBuilder;
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new SlashCommandBuilder()
      .setName('previous')
      .setDescription('previous')
      .setContexts(InteractionContextType.PrivateChannel, InteractionContextType.BotDM, InteractionContextType.Guild)
      .setIntegrationTypes(ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall);
  }

  async execute(interaction: ChatInputCommandInteraction | ButtonInteraction): Promise<void> {
    try {
      const previousData = await fetch(
        `http://localhost:${this.discord.Application.config.port}/proxy/playback/previous`
      );
      if (403 === previousData.status || 401 === previousData.status) {
        await interaction.followUp({ content: 'Account isnt logged in.', ephemeral: true });
        return;
      }
      if (200 !== previousData.status) {
        await interaction.followUp({ content: 'Something went wrong! Please try again.', ephemeral: true });
        return;
      }

      const data = await fetch(`http://localhost:${this.discord.Application.config.port}/proxy/playback/status`);
      if (403 === data.status || 401 === data.status) {
        await interaction.followUp({ content: 'Account isnt logged in.', ephemeral: true });
        return;
      }
      if (204 === data.status) {
        await interaction.followUp({ content: 'Nothing is playing.', ephemeral: true });
        return;
      }
      const playback = new Playback((await data.json()).data);
      const sendData: BaseMessageOptions = { embeds: [playback.toEmbed()], components: playback.toButtons() };
      if (interaction.isButton()) {
        await interaction.update(sendData);
      } else {
        await interaction.followUp(sendData);
      }
      await interaction.followUp({ content: 'Previous song is playing.', ephemeral: true });
    } catch (error) {
      if (error instanceof Error) this.discord.Application.Logger.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Something went wrong. Please try again later.', ephemeral: true });
        return;
      }
      await interaction.reply({ content: 'Something went wrong. Please try again later.', ephemeral: true });
    }
  }
}

export default PreviousCommand;
