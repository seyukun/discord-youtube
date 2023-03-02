import * as Discord from "discord.js";
import * as DiscordVoice from "@discordjs/voice";
import * as YoutubeStreamUrl from "youtube-stream-url";
import { Logger } from "tslog";
import { config } from "dotenv";

// Configure environment from .env
config();

// Change default console to 'tslog'
const console = new Logger();

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

const cli = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

// prettier-ignore
const debug = async (message: any) => !!process.env.debug ? console.debug(message) : void

// prettier-ignore
cli.on("ready", () => { console.info("ready"); });

cli.on("messageCreate", async (message) => {
  if (
    message.author.bot ||
    !message.guild ||
    !message.member ||
    !message.member.voice.channel ||
    !message.member.voice.channel.isVoiceBased()
  )
    return;

  // Make sure received message is start with "n!"
  if (message.content.startsWith("n!")) {
    // Resolve options
    let args: string[];
    [...args] = message.content
      .slice(2, message.content.length)
      .split(" ")
      .filter((m) => m != "");

    // Get youtube stream url
    let youtubeStreamUrl = await YoutubeStreamUrl.getInfo({ url: args[0] });

    debug(youtubeStreamUrl);
    if (!!youtubeStreamUrl) {
      // Get stream url
      let url: string =
        // Make sure its live stream
        youtubeStreamUrl.videoDetails.isLiveContent == true &&
        !!Object.keys(youtubeStreamUrl).find((k) => k == "liveData")
          ? // If its live, get live stream url
            // prettier-ignore
            (youtubeStreamUrl as any).liveData.data.segments.filter((d: any) => (d.streamInf.codecs[0] as string).includes("mp4a"))[0].url
          : // If its not live, get archive stream url
            // prettier-ignore
            youtubeStreamUrl.formats.filter((f: any) => (f.mimeType as string).startsWith("audio/mp4;"))[0].url;

      // Create connection
      let connection = DiscordVoice.joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
      });

      // Create audio player
      let player = DiscordVoice.createAudioPlayer();

      // Create audio resource
      // prettier-ignore
      let audioResource = DiscordVoice.createAudioResource(url, { inlineVolume: true });

      // Configure audio volume (0.04 / 100)
      audioResource.volume!.setVolume((1 / 100) * 4);

      // Set audio resource to player
      player.play(audioResource);

      // Set audio player to connection
      connection.subscribe(player);
    }
  }
});

cli.login();
