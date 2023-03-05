import * as Discord from "discord.js";
import * as DiscordVoice from "@discordjs/voice";
import * as YoutubeStreamUrl from "youtube-stream-url";
import axios from "axios";
import { Logger } from "tslog";
import { config } from "dotenv";
import { WriteStream } from "fs";

// Configure environment from .env
config();

// Change default console to 'tslog'
const console = new Logger();

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

const cli = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessageTyping,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildBans,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildScheduledEvents,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildWebhooks,
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.MessageContent,
  ],
  partials: [Discord.Partials.Channel],
});

// prettier-ignore
const debug = async (message: any) => !!process.env.DEBUG ? console.debug(message) : null;

cli.on("ready", () => {
  console.info("ready");
});

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

    // Create connection
    let connection = DiscordVoice.joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
    });

    // Get youtube stream url
    let youtubeStreamUrl = await YoutubeStreamUrl.getInfo({ url: args[0] });

    if (!!youtubeStreamUrl) {
      // Get stream url
      let url: string =
        // Make sure its live stream
        youtubeStreamUrl.videoDetails.isLiveContent == true &&
        !!Object.keys(youtubeStreamUrl).find((k) => k == "liveData")
          ? // If its live, get live stream url
            (youtubeStreamUrl as any).liveData.data.segments.filter((f: any) =>
              (f.streamInf.codecs[0] as string).includes("mp4a")
            )[0].url
          : // If its not live, get archive stream url
            youtubeStreamUrl.formats.filter((f: any) =>
              (f.mimeType as string).startsWith("audio/mp4;")
            )[0].url;

      debug(url);

      let { data } = await axios.get<WriteStream>(url, {
        responseType: "stream",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        },
      });
      data.on("pipe", (stream) => {
        debug(stream)

        // Create audio resource
        // prettier-ignore
        let audioResource = DiscordVoice.createAudioResource(stream, { inlineVolume: true });

        // Create audio player
        let player = DiscordVoice.createAudioPlayer();

        // Configure audio volume (10 / 100)
        audioResource.volume!.setVolume((1 / 100) * 10);

        // Set audio resource to player
        player.play(audioResource);

        // Set audio player to connection
        connection.subscribe(player);
      });

      // // Create audio resource
      // // prettier-ignore
      // let audioResource = DiscordVoice.createAudioResource(url, { inlineVolume: true });

      // // Create audio player
      // let player = DiscordVoice.createAudioPlayer();

      // // Configure audio volume (10 / 100)
      // audioResource.volume!.setVolume((1 / 100) * 10);

      // // Set audio resource to player
      // player.play(audioResource);

      // // Set audio player to connection
      // connection.subscribe(player);
    }
  }
});

cli.login();
