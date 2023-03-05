import * as Discord from "discord.js";
import axios from "axios";
import { Logger } from "tslog";
import { config } from "dotenv";

// Configure environment from .env
config();

// Change default console to 'tslog'
const console = new Logger();

// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));

// prettier-ignore
const cli = new Discord.Client({ intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536], partials: [Discord.Partials.Channel] });

// prettier-ignore
const debug = async (guild: Discord.Guild, message: string) => !!process.env.DEBUG ? console.debug(`${guild.id}: ${message}`) : null;

// prettier-ignore
cli.on("ready", () => { console.info("ready") });

cli.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith("n!")) {
    let args: string[];
    [...args] = message.content
      .slice(2, message.content.length)
      .split(" ")
      .filter((m) => m != "");

    let response = await axios.get<{ domain: string; description: string }>(
      `http://cns:3000/api/v1/${args[0]}`
    );

    if (
      Object.keys(response.data).includes("domain") &&
      Object.keys(response.data).includes("description") &&
      Object.keys(response.data).length == 2
    ) {
      let domain = response.data.domain;
      let description = response.data.description;
      message.reply(`${domain}: ${description}`);
    }
  }
});

cli.login();
