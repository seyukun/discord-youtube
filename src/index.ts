import * as Discord from "discord.js";
import * as DiscordVoice from "@discordjs/voice";
import * as Youtube from "youtube-stream-url";
import { Logger } from "tslog";
import { config } from "dotenv";

config();
const console = new Logger();
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
cli.on("ready", async () => {
  console.info("ready");
});

cli.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.guild == null) return;
  if (msg.member == null) return;
  if (msg.content.startsWith("n!")) {
    let args: string[];
    [...args] = msg.content
      .slice(2, msg.content.length)
      .split(" ")
      .filter((m) => m != "");
    if (msg.member.voice.channel && msg.member.voice.channel.isVoiceBased()) {
      let con = DiscordVoice.joinVoiceChannel({
        channelId: msg.member.voice.channel.id,
        guildId: msg.guild.id,
        adapterCreator: msg.member.voice.channel.guild.voiceAdapterCreator,
      });
      let res = await Youtube.getInfo({ url: args[0] });
      console.debug(res);
      if (res != false) {
        let url: string = res.formats.filter(
          //@ts-ignore
          (f) => (f.mimeType as string).startsWith("audio/mp4;")
        )[0].url;
        console.debug(url);
        if (
          res.videoDetails.isLiveContent == true &&
          Object.keys(res).find((k) => k == "liveData")
        ) {
          //@ts-ignore
          url = res.liveData.data.segments.filter((d) =>
            (d.streamInf.codecs[0] as string).includes("mp4a")
          )[0].url;
        }
        let player = DiscordVoice.createAudioPlayer();
        let src = DiscordVoice.createAudioResource(url, { inlineVolume: true });
        src.volume?.setVolume((1 / 100) * 4);
        player.play(src);
        con.subscribe(player);
      }
    }
  }
});

cli.login();
