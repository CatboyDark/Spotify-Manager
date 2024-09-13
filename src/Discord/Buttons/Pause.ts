import Button from '../Private/Button';
import ButtonData from '../Private/ButtonData';
import DiscordManager from '../DiscordManager';
import { ButtonInteraction } from 'discord.js';

class PauseButton extends Button {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new ButtonData('pause');
  }

  async execute(interaction: ButtonInteraction): Promise<void> {
    const command = interaction.client.commands.get(interaction.customId);
    if (command === undefined) {
      await interaction.reply({ content: 'Can i click ur buttons?', ephemeral: true });
      return;
    }
    await command.execute(interaction);
  }
}

export default PauseButton;
