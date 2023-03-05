"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = __importStar(require("discord.js"));
const DiscordVoice = __importStar(require("@discordjs/voice"));
const YoutubeStreamUrl = __importStar(require("youtube-stream-url"));
const axios_1 = __importDefault(require("axios"));
const tslog_1 = require("tslog");
const dotenv_1 = require("dotenv");
// Configure environment from .env
(0, dotenv_1.config)();
// Change default console to 'tslog'
const console = new tslog_1.Logger();
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
const debug = (message) => __awaiter(void 0, void 0, void 0, function* () { return !!process.env.DEBUG ? console.debug(message) : null; });
cli.on("ready", () => {
    console.info("ready");
});
cli.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author.bot ||
        !message.guild ||
        !message.member ||
        !message.member.voice.channel ||
        !message.member.voice.channel.isVoiceBased())
        return;
    // Make sure received message is start with "n!"
    if (message.content.startsWith("n!")) {
        // Resolve options
        let args;
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
        let youtubeStreamUrl = yield YoutubeStreamUrl.getInfo({ url: args[0] });
        if (!!youtubeStreamUrl) {
            // Get stream url
            let url = 
            // Make sure its live stream
            youtubeStreamUrl.videoDetails.isLiveContent == true &&
                !!Object.keys(youtubeStreamUrl).find((k) => k == "liveData")
                ? // If its live, get live stream url
                    youtubeStreamUrl.liveData.data.segments.filter((f) => f.streamInf.codecs[0].includes("mp4a"))[0].url
                : // If its not live, get archive stream url
                    youtubeStreamUrl.formats.filter((f) => f.mimeType.startsWith("audio/mp4;"))[0].url;
            debug(url);
            let { data } = yield axios_1.default.get(url, {
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
                },
            });
            data.on("pipe", (stream) => {
                debug(stream);
                // Create audio resource
                // prettier-ignore
                let audioResource = DiscordVoice.createAudioResource(stream, { inlineVolume: true });
                // Create audio player
                let player = DiscordVoice.createAudioPlayer();
                // Configure audio volume (10 / 100)
                audioResource.volume.setVolume((1 / 100) * 10);
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
}));
cli.login();
//# sourceMappingURL=index.js.map