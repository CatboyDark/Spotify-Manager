import InteractionHandler from './handlers/InteractionHandler';
import Logger from './utils/Logger';
import StateHandler from './handlers/StateHandler';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { SlashCommand } from './types/main';
import { readdirSync } from 'fs';
import { token } from '../config.json';

class DiscordManager {
  interactionHandler: InteractionHandler;
  stateHandler: StateHandler;
  client?: Client;
  Logger: Logger;
  constructor() {
    this.interactionHandler = new InteractionHandler(this);
    this.stateHandler = new StateHandler(this);
    this.Logger = new Logger();
  }

  connect(): void {
    this.client = new Client({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds
      ]
    });

    this.deployCommands();
    this.client.on('ready', () => this.stateHandler.onReady());
    this.client.on('interactionCreate', (interaction) => this.interactionHandler.onInteraction(interaction));

    this.client.login(token).catch((e) => this.Logger.error(e));
  }

  async deployCommands(): Promise<void> {
    if (!this.client) return;
    this.client.commands = new Collection<string, SlashCommand>();
    const commandFiles = readdirSync('./src/commands');
    const commands = [];
    for (const file of commandFiles) {
      const command = new (await import(`./commands/${file}`)).default(this);
      commands.push(command.data.toJSON());
      if (command.data.name) {
        this.client.commands.set(command.data.name, command);
      }
    }
    const rest = new REST({ version: '10' }).setToken(token);
    const clientID = Buffer.from(token.split('.')[0], 'base64').toString('ascii');
    await rest.put(Routes.applicationCommands(clientID), { body: commands });
    this.Logger.discord(`Successfully reloaded ${commands.length} application command(s).`);
  }
}

export default DiscordManager;
