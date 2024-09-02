import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import dot_env from "dotenv";
import { GamerBotAPI } from "gamerbot-module";
import { Command } from "./classes/command";
import fs from "fs";
import { Handler } from "./classes/handler";
dot_env.config();

const TOKEN = process.env.TOKEN;
const GAMERBOT_API_TOKEN = process.env.GAMERBOT_API_TOKEN;

export const GamerBotAPIInstance = new GamerBotAPI(GAMERBOT_API_TOKEN,true);

//Extends the client to add new properties
export interface GamerbotClient extends Client {
    commands: Collection<string, Command>;
    command_array: any;
}

//Creates the client that is going to do all actions!
const client = new Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
}) as GamerbotClient;

//Create collections
client.commands = new Collection();
client.command_array = [];

//load and run all handlers
let files = fs.readdirSync('./src/handlers');
files.forEach(async file => {
    await import(`./handlers/${file}`).then(handler_file => {
        let handler : Handler = new handler_file.default();
        handler.run(client);
    });
});

client.login(TOKEN);
