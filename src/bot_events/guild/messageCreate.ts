import { Client, GuildMember, Message } from "discord.js";
import { Event } from "../../classes/event.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";
import { GuildData, PorfileData } from "gamerbot-module";
import { updateLevelRoles } from "../../functions/updateLevelRoles.js";

export default class messageCreate implements Event {
    constructor() {}
    async run_event(client: Client, message: Message) {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        const guild_data = await GamerBotAPIInstance.models.get_guild_data(
            message.guild?.id as string,
        );

        this.addReaction(message);
        this.xpCalculation(message, guild_data);
        this.messageInteraction(message);
        this.removeLink(message, guild_data);
    }

    private async xpCalculation(message: Message, guild_data: GuildData) {
        if (guild_data.noXpChannels.includes(message.channel.id)) return;

        // Check if the message is in a thead from general chat and random shit
        const GENERAL_CHAT = "516611606822649870";
        const RANDOM_SHIT = "879782686468767794";
        if (
            message.channel.isThread() &&
            (message.thread?.parentId == GENERAL_CHAT ||
                message.thread?.parentId == RANDOM_SHIT)
        )
            return;

        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            message.member?.id as string,
        );

        //returns until time is calculated
        if (profile_data.xpTimeoutUntil > message.createdTimestamp) return;

        const time_out = 10 * 60 * 1000; // ten mins

        //adds timeout
        profile_data.xpTimeoutUntil = message.createdTimestamp + time_out;

        //Gives xp, if similar word only give 1 xp.
        if (profile_data.old_messages.length >= 3)
            profile_data.old_messages.shift();

        if (profile_data.old_messages.includes(message.content.toLowerCase())) {
            profile_data.xp += 1;
        } else {
            profile_data.xp += 3;
        }
        profile_data.old_messages.push(message.content.toLowerCase());

        const lvl_cap = 31;

        //if level up. xp cap is at lvl 30!
        if (
            (profile_data.level ** 2 < profile_data.xp &&
                profile_data.level <= 31) ||
            (lvl_cap ** 2 < profile_data.xp && profile_data.level > 31)
        ) {
            profile_data.xp = 0;
            profile_data.level += 1;
            this.sendLvlText(profile_data, message);
            updateLevelRoles(message.member as GuildMember, profile_data);
        }

        profile_data.save();
    }
    private async sendLvlText(profile_data: PorfileData, message: Message) {
        let level_text = `Du levlade upp till level \`${profile_data.level - 1}\` i Onlineföreningen SGCs discord. Grattis!`;

        const config_data = await GamerBotAPIInstance.models.get_config_data(
            parseInt(process.env.CONFIG_ID as string),
        );

        //eslint-disable-next-line
        (config_data.xp as unknown as any).levels.forEach((level: any) => {
            if (
                profile_data.level - 1 == level.level &&
                level.message != undefined
            ) {
                level_text += level.message;
            }
        });
        message.member?.send(level_text).catch(() => {});
    }

    private messageInteraction(message: Message) {

        const message_interaction = (
            message.client as GamerbotClient
        ).messageInteractions.find(
            (message_interaction) =>
                message.content.toLowerCase().includes(message_interaction.name),
        );
        if (message_interaction) {
            message_interaction.execute(message);
        }
    }

    async removeLink(message: Message, guild_data: GuildData) {
        const link_roles = guild_data.trustedLinkRoles;
        const whitelistedLinks = guild_data.whitelistedLinks;
        const whitelistedChannels = guild_data.allowedLinksChannels;

        const notAllowed = (msg: Message) => {
            if (!msg.channel.isSendable()) return;
            msg.channel
                .send({
                    content: "Du har inte tillåtelse att skicka länkar här",
                })
                .then((sentMessage) => {
                    setTimeout(() => {
                        sentMessage.delete().catch(() => {});
                    }, 5000);
                });
            msg.delete().catch(() => {});
        };

        const urlRegex =
            /((https?:\/\/)|(www\.)|(discord\.((com\/invite\/)|(gg\/)))[^\s]+)/;

        const linkFound = message.content.match(urlRegex) != null;

        if (!linkFound) return;

        if (message.member?.roles.cache.hasAny(...link_roles)) return;

        if (
            (
                await GamerBotAPIInstance.models.get_profile_data(
                    message.member?.id as string,
                )
            ).level < 2
        )
            return notAllowed(message);

        if (whitelistedChannels.includes(message.channel.id)) return;

        notAllowed(message);
    }
    
    //Move function to a more dynamic place TODO
    async addReaction(message: Message) {
        if(message.channel.id == "1352009789378662492"){
            await message.react("❤");
            await message.react("💬");
            await message.react("🔁");
        }
    }
}
