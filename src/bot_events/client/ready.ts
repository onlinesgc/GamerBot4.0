import { Client } from "discord.js";
import { event } from "../../classes/event";
/**
 * Ready is called when the bot is turned on.
 * @param client - Discord client
 */
export class ready implements event{
    run_event(client:Client){
        console.log(`${client.user?.username} is online! `+
            `Hosting ${client.users.cache.size} users, `+
            `in ${client.channels.cache.size} `+
            `channels of ${client.guilds.cache.size} guilds.`);
            
    }
}