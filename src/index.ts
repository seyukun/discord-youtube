import * as Discord from "discord.js";
import * as DiscordVoice from "@discordjs/voice";
import * as YoutubeStreamUrl from "youtube-stream-url";
import Stream from "stream";
import m3u8stream from "m3u8stream";
import axios, { AxiosRequestConfig } from "axios";
import { Logger } from "tslog";
import { config } from "dotenv";
import { WriteStream } from "node:fs";

// Configure environment from .env
config();

// Change default console to 'tslog'
const console = new Logger();

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

// prettier-ignore
const cli = new Discord.Client({ intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536], partials: [ Discord.Partials.Channel ] });

// prettier-ignore
const debug = async (guild: Discord.Guild, message:string) => !!process.env.DEBUG ? console.debug(`${guild.id}: ${message}`) : null;

// AXIOS Config
// prettier-ignore
const axiosConfig: AxiosRequestConfig = { responseType: "stream", headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36" }};

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
    debug(message.guild, "Recive Request");

    // Get youtube stream url
    let youtubeStreamInfo = await YoutubeStreamUrl.getInfo({ url: args[0] });

    if (!!youtubeStreamInfo) {
      debug(message.guild, "Accept Request");

      // Create Buffer
      let audioSource = new Stream.Transform();

      // Make sure its LiveStream
      if (
        youtubeStreamInfo.videoDetails.isLiveContent == true &&
        Object.keys(youtubeStreamInfo).includes("liveData")
      ) {
        /* FOR LIVE STREAMING (HLS) */

        // Get Url
        // prettier-ignore
        let url = (youtubeStreamInfo as any).liveData.data.segments.filter((f: any) => (f.streamInf.codecs[0] as string).includes("mp4a") )[0].url;

        // Load stream of HLS from url
        (async (stream) => {
          stream.on("data", (src) => audioSource.push(src));
        })(m3u8stream(url));
        debug(message.guild, "Loaded Stream of HLS");
      } else {
        /* FOR ARCHIVE (FILE) */

        // Get Url
        // prettier-ignore
        let url = youtubeStreamInfo.formats.filter((f: any) => (f.mimeType as string).startsWith("audio/mp4;") )[0].url;

        // Load stream from url
        let stream = (await axios.get<WriteStream>(url, axiosConfig)).data;

        // Insert it to buffer
        stream.on("data", (src: Buffer) => audioSource.push(src));
        debug(message.guild, "Loaded Stream of file");
      }

      // Create audio resource
      // prettier-ignore
      let audioResource = DiscordVoice.createAudioResource(audioSource, { inlineVolume: true });

      // Create audio player
      let player = DiscordVoice.createAudioPlayer();

      // Configure audio volume (10 / 100)
      audioResource.volume!.setVolume((1 / 100) * 10);

      // Set audio resource to player
      player.play(audioResource);

      // Create connection
      let connection = DiscordVoice.joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.member.voice.channel.guild.voiceAdapterCreator,
      });

      /** [ Patch ]  Discord Api Bug */
      connection.on("stateChange", (Old, New) =>
        Old.status === DiscordVoice.VoiceConnectionStatus.Ready &&
        New.status === DiscordVoice.VoiceConnectionStatus.Connecting
          ? ((_) => debug(message.guild!, "KeepAlive"))(
              connection.configureNetworking()
            )
          : null
      );

      // Set audio player to connection
      connection.subscribe(player);
    }
  }
});

cli.login();
