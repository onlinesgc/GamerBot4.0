import { Client, REST, Routes } from "discord.js";
import { Event } from "../../classes/event.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";
import { ConfigData, UserData } from "gamerbot-module";
import UnBanTimer from "../custom_events/unbanTimer.js";
/**
 * Ready is called when the bot is turned on.
 * @param client - Discord client
 */
export default class ready implements Event {
    constructor() {}
    async runEvent(client: Client) {
        // Log that the bot is online
        console.log(
            `${client.user?.username} is online! ` +
                `Hosting ${client.users.cache.size} users, ` +
                `in ${client.channels.cache.size} ` +
                `channels of ${client.guilds.cache.size} guilds.`,
        );

        // Get API status and config data and logs it
        const status = await GamerBotAPIInstance.getAPIStatus();
        if(status == false) {
            await new Promise<boolean>(() =>{
                const t = setInterval(()=>{
                    if(GamerBotAPIInstance.apiStatus){
                        clearInterval(t);
                    }
                }, 5000);
            });
        }

        // Get config data from the API
        const configData = await GamerBotAPIInstance.models.getConfigData(
            parseInt(process.env.CONFIG_ID as string),
        );

        // Register commands and load user reminders
        this.regiserCommands(client as GamerbotClient, configData);
        this.loadReminders(client as GamerbotClient);

        // load unbantimer
        const unbanTimer = new UnBanTimer();
        unbanTimer.emitor(client);
    }

    /**
     * Connects to discord and registers commands
     * @param {Client} client
     * @param {*} configData
     */
    private async regiserCommands(
        client: GamerbotClient,
        configData: ConfigData,
    ) {
        // Register commands here
        const rest = new REST({ version: "9" }).setToken(
            process.env.TOKEN as string,
        );
        let routesFunc;

        if (!configData.debugGuildId) {
            routesFunc = Routes.applicationCommands(client.user?.id as string);
        } else {
            routesFunc = Routes.applicationGuildCommands(
                client.user?.id as string,
                configData.debugGuildId as string,
            );
        }

        await rest
            .put(routesFunc, { body: client.command_array })
            .catch((error) => console.error(error));
    }

    /**
     * Loads user reminders onces the bot is online
     * @param client Client
     * @param configData ConfigData
     */
    private async loadReminders(client: GamerbotClient) {
        const profiles = await GamerBotAPIInstance.models.getAllUserData(
            50000,
            { reminders: { $exists: true, $not: { $size: 0 } } },
        );
        profiles.forEach((profile: UserData) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            profile.reminders.forEach((reminder: any) => {
                const reminderTemp = {
                    userId: profile.userId,
                    message: reminder.message,
                    remindTimestamp: reminder.remindTimestamp,
                };
                client.reminderList.push(reminderTemp);
            });
        });
    }
}
