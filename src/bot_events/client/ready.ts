import { Client, REST, Routes } from "discord.js";
import { Event } from "../../classes/event.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";
import { ConfigData, PorfileData } from "gamerbot-module";
import UnBanTimer from "../custom_events/unbanTimer.js";
/**
 * Ready is called when the bot is turned on.
 * @param client - Discord client
 */
export default class ready implements Event {
    constructor() {}
    async run_event(client: Client) {
        // Log that the bot is online
        console.log(
            `${client.user?.username} is online! ` +
                `Hosting ${client.users.cache.size} users, ` +
                `in ${client.channels.cache.size} ` +
                `channels of ${client.guilds.cache.size} guilds.`,
        );

        // Get API status and config data and logs it
        await GamerBotAPIInstance.getAPIStatus();

        // Get config data from the API
        const config_data = await GamerBotAPIInstance.models.get_config_data(
            parseInt(process.env.CONFIG_ID as string),
        );

        // Register commands and load user reminders
        this.regiser_commands(client as GamerbotClient, config_data);
        this.load_reminders(client as GamerbotClient);

        // load unbantimer
        const unban_timer = new UnBanTimer();
        unban_timer.emitor(client);
    }

    /**
     * Connects to discord and registers commands
     * @param {Client} client
     * @param {*} configData
     */
    private async regiser_commands(
        client: GamerbotClient,
        config_data: ConfigData,
    ) {
        // Register commands here
        const rest = new REST({ version: "9" }).setToken(
            process.env.TOKEN as string,
        );
        let routesFunc;

        if (!config_data.debugGuildID) {
            routesFunc = Routes.applicationCommands(client.user?.id as string);
        } else {
            routesFunc = Routes.applicationGuildCommands(
                client.user?.id as string,
                config_data.debugGuildID as string,
            );
        }

        await rest
            .put(routesFunc, { body: client.command_array })
            .catch((error) => console.error(error));
    }

    /**
     * Loads user reminders onces the bot is online
     * @param client Client
     * @param config_data ConfigData
     */
    private async load_reminders(client: GamerbotClient) {
        const profiles = await GamerBotAPIInstance.models.get_all_profile_data(
            50000,
            { reminders: { $exists: true, $not: { $size: 0 } } },
        );
        profiles.forEach((profile: PorfileData) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            profile.reminders.forEach((reminder: any) => {
                const reminder_temp = {
                    user_id: profile.userID,
                    message: reminder.message,
                    remindTimestamp: reminder.remindTimestamp,
                };
                client.reminder_list.push(reminder_temp);
            });
        });
    }
}
