import { CustomEvent } from '../../classes/custom_event'
import { GamerBotAPIInstance } from '../..';
import { ModLog } from '../../classes/modlog';
import { Client, Guild } from 'discord.js';

export default class UnBanTimer implements CustomEvent {
    async run_unban_event(client: Client, guild:Guild) {
        const time_now = Date.now();
        const guild_config_data = await GamerBotAPIInstance.models.get_guild_data(guild.id);
        guild_config_data.bansTimes.forEach(async (ban, index) => {
            //eslint-disable-next-line
            if((ban as any).unbantime <= time_now){
                //eslint-disable-next-line
                const userId = (ban as any).userID;

                const user = client.users.cache.get(userId.id);

                if(user == undefined) return;

                const profile_data = await GamerBotAPIInstance.models.get_profile_data(
                    userId.id,
                )
                const modlog = new ModLog(
                    'unban',
                    userId,
                    user?.username as string,
                    "Tiden har runnit ut",
                    null,
                    Date.now(),
                    "[Gamerbot]",
                )
        
                profile_data.modLogs.push(modlog)
                profile_data.save()
        
        
                await user
                    .send(
                        `Du har blivit unbannad i SGC.\nhttps://discord.sgc.se to join`,
                    )
                    .catch(() => {});
        
                await guild.members.unban(user.id)
                guild_config_data.bansTimes.splice(index, 1);
                await guild_config_data.save();
            }
        });
    }

    emitor(client: Client) {
        client.guilds.cache.forEach(guild => {
            setInterval(() => this.run_unban_event(client, guild), 1000*30);
        })
    }
}