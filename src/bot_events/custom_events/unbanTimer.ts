import { GamerBotAPIInstance } from "../../index.js";
import { ModLog } from "../../classes/modlog.js";
import { Client, Guild } from "discord.js";

export default class UnBanTimer {
    async run_unban_event(client: Client, guild: Guild) {
        const time_now = Date.now();
        const guild_config_data =
            await GamerBotAPIInstance.models.get_guild_data(guild.id);
        guild_config_data.bansTimes.forEach(async (ban, index) => {
            //eslint-disable-next-line
            if ((ban as any).unbantime <= time_now) {
                //eslint-disable-next-line
                const userId = (ban as any).userID;

                const user = await guild.bans.fetch(userId).catch(() => {});

                if (user == undefined) return;

                const profile_data =
                    await GamerBotAPIInstance.models.get_profile_data(
                        userId.id,
                    );
                const modlog = new ModLog(
                    "unban",
                    userId,
                    user.user.username as string,
                    "Tiden har runnit ut",
                    null,
                    Date.now(),
                    "[Gamerbot]",
                );

                profile_data.modLogs.push(modlog);
                profile_data.save();

                await user.user
                    .send(
                        `Du har blivit unbannad i SGC.\nhttps://discord.sgc.se to join`,
                    )
                    .catch(() => {});

                await guild.members.unban(user.user.id);
                guild_config_data.bansTimes.splice(index, 1);
                await guild_config_data.save();
            }
        });
    }

    async emitor(client: Client) {
        const guild = client.guilds.cache.get("516605157795037185");
        if (guild == undefined) return;
        setInterval(() => {
            this.run_unban_event(client, guild);
        }, 1000 * 5);
    }
}
