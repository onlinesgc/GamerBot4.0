import { Client, REST, Routes } from "discord.js";
import { Event } from "../../classes/event";
import { ConfigData } from "gamerbot-module/dist/classes/config_data";
import { GamerBotAPIInstance, GamerbotClient } from "../..";
/**
 * Ready is called when the bot is turned on.
 * @param client - Discord client
 */
export default class ready implements Event{
    constructor(){};
    async run_event(client:Client){
        console.log(`${client.user?.username} is online! `+
            `Hosting ${client.users.cache.size} users, `+
            `in ${client.channels.cache.size} `+
            `channels of ${client.guilds.cache.size} guilds.`);
        await GamerBotAPIInstance.getAPIStatus();
        let config_data : ConfigData = await GamerBotAPIInstance.models.get_config_data(Number.parseInt(process.env.CONFIG_ID as string));
        this.regiser_commands(client as GamerbotClient,config_data);
    }
    /**
     * Connects to discord and registers commands
     * @param {Client} client 
     * @param {*} configData 
    */
    private regiser_commands(client:GamerbotClient, config_data:ConfigData){
        // Register commands here
        new Promise(async (resolve,reject) => {
            const rest = new REST({version:'9'}).setToken(process.env.TOKEN as string);
            try{
                if(config_data.debugGuildID != undefined){
                    await rest.put(
                        Routes.applicationGuildCommands(
                            client.user?.id as string,
                            config_data.debugGuildID as string),
                            {body:client.command_array}
                    );
                }
                else{
                    await rest.put(
                        Routes.applicationCommands(client.user?.id as string),
                        {body:client.command_array}
                    );
                }
                resolve(0);
            }catch(error){
                console.error(error);
                reject(1);
            }
        })
    }
}