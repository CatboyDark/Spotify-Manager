import Embed from '../../../Discord/Private/Embed';
import Track from './Track';
import { EmbedBuilder } from 'discord.js';

class Queue {
  currentPlayback: Track;
  queue: Track[];
  constructor(data: Record<string, any>) {
    this.currentPlayback = new Track(data.currently_playing);
    this.queue = data.queue.map((track: Record<string, any>) => new Track(track));
  }

  toString(): Track {
    return this.queue[0];
  }

  toEmbed(): EmbedBuilder {
    const embed = new Embed({ title: 'Queue', description: 'Upcomming Queue' }).build();
    this.queue.map((track) => {
      embed.addFields({
        name: `${track.name} ${track.toEmojis()}`,
        value: `[${track.album.name}](<${track.album.spotifyUrl || 'https://open.spotify.com/'}>) | [${track.artists[0].name}](<${track.artists[0].spotifyUrl || 'https://open.spotify.com/'}>)`
      });
    });
    return embed;
  }
}

export default Queue;
