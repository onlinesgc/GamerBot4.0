import { Client, GuildMember } from "discord.js";
import { Event } from "../../classes/event";

export default class GuildMemberRemove implements Event {
    constructor() {}
    async runEvent(client: Client, member: GuildMember) {
        const TRUSTED_ROLES_ID = ["818809151257575464", "872157696709783552", "821059798270214176", "1091356358890225674"];
        const CHANNEL_ID = "948330068575391784";
        if (TRUSTED_ROLES_ID.some(role => member.roles.cache.has(role))) {
            const channel = await member.guild.channels.fetch(CHANNEL_ID)
            if (channel?.isTextBased()) {
                channel.send(`Medlemmen ${member.user.username} har lämnat servern! <@&1071466487069556746>`);
            }
        }
    }
}