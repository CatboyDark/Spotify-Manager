import Device from './Devices';
import Track from './Track';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { emojis } from '../../../../config.json';

export type RepeatState = 'off' | 'track' | 'context';

class Playback {
  device: Device;
  shuffleState: boolean;
  smartShuffle: boolean;
  repeatState: RepeatState;
  timestamp: number;
  item: Track;
  progressMS: number;
  progress: number;
  playingType: string;
  playing: boolean;
  constructor(data: Record<string, any>) {
    this.device = data.device;
    this.shuffleState = data.shuffle_state;
    this.smartShuffle = data.smart_shuffle;
    this.repeatState = data.repeat_state;
    this.timestamp = data.timestamp;
    this.item = new Track(data.item);
    this.progressMS = data.progress_ms;
    this.progress = this.progressMS / this.item.duration;
    this.playingType = data.currently_playing_type;
    this.playing = data.is_playing;
  }

  toString(): Track {
    return this.item;
  }

  toJSON(): Record<string, any> {
    return {
      device: this.device.toJSON(),
      shuffleState: this.shuffleState,
      smartShuffle: this.smartShuffle,
      repeatState: this.repeatState,
      timestamp: this.timestamp,
      progress: this.progressMS,
      item: this.item.toJSON(),
      playingType: this.playingType,
      playing: this.playing
    };
  }

  getPrograssBar(): string {
    return '█'.repeat(Math.floor(this.progress * 20)) + '-'.repeat(20 - Math.floor(this.progress * 20));
  }

  // getVolumeBar(): string {

  toEmbed(): EmbedBuilder {
    const duration = `${Math.floor(this.item.duration / 60000)}:${Math.floor((this.item.duration % 60000) / 1000)
      .toString()
      .padStart(2, '0')}`;
    const progress = `${Math.floor(this.progressMS / 60000)}:${Math.floor((this.progressMS % 60000) / 1000)
      .toString()
      .padStart(2, '0')}`;
    return this.item
      .toEmbed()
      .setTitle(`Currently ${this.playing ? 'Playing' : 'Paused'}`)
      .addFields({
        name: 'Progress',
        value: `${progress} ${this.getPrograssBar()} ${duration}`,
        inline: true
      });
  }

  toButtons(): ActionRowBuilder<ButtonBuilder>[] {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setEmoji(emojis.shuffle)
          .setStyle(this.shuffleState ? ButtonStyle.Success : ButtonStyle.Danger)
          .setCustomId('shuffle'),
        new ButtonBuilder().setEmoji(emojis.back).setStyle(ButtonStyle.Secondary).setCustomId('previous'),
        new ButtonBuilder()
          .setEmoji(this.playing ? emojis.pause : emojis.play)
          .setStyle(this.playing ? ButtonStyle.Success : ButtonStyle.Danger)
          .setCustomId(this.playing ? 'pause' : 'play'),
        new ButtonBuilder().setEmoji(emojis.skip).setStyle(ButtonStyle.Secondary).setCustomId('skip'),
        new ButtonBuilder()
          .setEmoji('track' === this.repeatState ? emojis.repeatOne : emojis.repeat)
          .setStyle('off' === this.repeatState ? ButtonStyle.Danger : ButtonStyle.Success)
          .setCustomId('repeat')
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setEmoji(emojis.refresh).setStyle(ButtonStyle.Secondary).setCustomId('refresh'),
        new ButtonBuilder().setEmoji(emojis.queue).setStyle(ButtonStyle.Secondary).setCustomId('queue'),
        new ButtonBuilder()
          .setEmoji(emojis.spotify)
          .setStyle(ButtonStyle.Link)
          .setURL(this.item.spotifyUrl || 'https://open.spotify.com')
      )
    ];
  }
}

export default Playback;
