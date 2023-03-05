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
const axios_1 = __importDefault(require("axios"));
const tslog_1 = require("tslog");
const dotenv_1 = require("dotenv");
// Configure environment from .env
(0, dotenv_1.config)();
// Change default console to 'tslog'
const console = new tslog_1.Logger();
// continue process when an error occurs and log
process.on("uncaughtException", (err) => console.error(err));
// prettier-ignore
const cli = new Discord.Client({ intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536], partials: [Discord.Partials.Channel] });
// prettier-ignore
const debug = (guild, message) => __awaiter(void 0, void 0, void 0, function* () { return !!process.env.DEBUG ? console.debug(`${guild.id}: ${message}`) : null; });
// prettier-ignore
cli.on("ready", () => { console.info("ready"); });
cli.on("messageCreate", (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author.bot)
        return;
    if (message.content.startsWith("n!")) {
        let args;
        [...args] = message.content
            .slice(2, message.content.length)
            .split(" ")
            .filter((m) => m != "");
        let response = yield axios_1.default.get(`http://localhost:3000/api/v1/${args[0]}`);
        if (Object.keys(response.data).includes("domain") &&
            Object.keys(response.data).includes("description") &&
            Object.keys(response.data).length == 2) {
            let domain = response.data.domain;
            let description = response.data.description;
            message.reply(`${domain}: ${description}`);
        }
    }
}));
cli.login();
//# sourceMappingURL=index.js.map