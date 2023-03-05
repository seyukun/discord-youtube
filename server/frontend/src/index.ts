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

const cli = new Discord.Client({ intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536], partials: [Discord.Partials.Channel] });

const debug = async (guild: Discord.Guild, message: string) => !!process.env.DEBUG ? console.debug(`${guild.id}: ${message}`) : null;

cli.on("ready", () => {
  console.info("ready");
});

cli.on("messageCreate", async (message) => {

});

cli.login();