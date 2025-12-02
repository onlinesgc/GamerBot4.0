import { GamerBotAPIInstance } from "../../index.js";
import { ModLog } from "../../classes/modlog.js";
import { Client, Guild } from "discord.js";

export default class UnBanTimer {
    async runUnbanEvent(client: Client, guild: Guild) {
        const timeNow = Date.now();

        const guildConfigData =
            await GamerBotAPIInstance.models.getGuildData(guild.id);
        
        guildConfigData.autoModeration.bannedUsers.forEach(async (ban, index) => {
            //eslint-disable-next-line
            if ((ban as any).unbantime <= timeNow) {
                //eslint-disable-next-line
                const userId = (ban as any).userID;

                const user = await guild.bans.fetch(userId).catch(() => {});

                if (user == undefined) return;

                const userData =
                    await GamerBotAPIInstance.models.getUserData(
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

                userData.modLogs.push(modlog);
                userData.save();

                await user.user
                    .send(
                        `Du har blivit unbannad i SGC.\nhttps://discord.sgc.se to join`,
                    )
                    .catch(() => {});

                await guild.members.unban(user.user.id);
                guildConfigData.autoModeration.bannedUsers.splice(index, 1);
                await guildConfigData.save();
            }
        });
    }

    async emitor(client: Client) {
        const guild = client.guilds.cache.get("516605157795037185");
        if (guild == undefined) return;
        setInterval(() => {
            this.runUnbanEvent(client, guild);
        }, 1000 * 5);
    }
}
