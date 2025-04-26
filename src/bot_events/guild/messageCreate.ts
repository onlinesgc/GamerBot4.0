import { Client, GuildMember, Message } from "discord.js";
import { Event } from "../../classes/event.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";
import { GuildData, Level, UserData } from "gamerbot-module";
import { updateLevelRoles } from "../../functions/updateLevelRoles.js";

export default class messageCreate implements Event {
    constructor() {}
    async runEvent(client: Client, message: Message) {
        if (message.author.bot) return;
        if (!message.inGuild()) return;

        const guildData = await GamerBotAPIInstance.models.getGuildData(
            message.guild?.id as string,
        );

        this.addReaction(message);
        this.xpCalculation(message, guildData);
        this.messageInteraction(message);
        this.removeLink(message, guildData);
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

        const userData = await GamerBotAPIInstance.models.getUserData(
            message.member?.id as string,
        );

        //returns until time is calculated
        if (userData.levelSystem.xpTimeoutUntil > message.createdTimestamp) return;

        const time_out = 10 * 60 * 1000; // ten mins

        //adds timeout
        userData.levelSystem.xpTimeoutUntil = message.createdTimestamp + time_out;

        //Gives xp, if similar word only give 1 xp.
        if (userData.levelSystem.oldMessages.length >= 3)
            userData.levelSystem.oldMessages.shift();

        if (userData.levelSystem.oldMessages.includes(message.content.toLowerCase())) {
            userData.levelSystem.xp += 1;
        } else {
            userData.levelSystem.xp += 3;
        }
        userData.levelSystem.oldMessages.push(message.content.toLowerCase());

        const lvl_cap = 31;

        //if level up. xp cap is at lvl 30!
        if (
            (userData.levelSystem.level ** 2 < userData.levelSystem.xp &&
                userData.levelSystem.level <= 31) ||
            (lvl_cap ** 2 < userData.levelSystem.xp && userData.levelSystem.level > 31)
        ) {
            userData.levelSystem.xp = 0;
            userData.levelSystem.level += 1;
            this.sendLvlText(userData, message);
            await updateLevelRoles(message.member as GuildMember, userData);
        }

        userData.save();
    }
    private async sendLvlText(userData: UserData, message: Message) {
        let levelText = `Du levlade upp till level \`${userData.levelSystem.level - 1}\` i Onlineföreningen SGCs discord. Grattis!`;

        const configData = await GamerBotAPIInstance.models.getConfigData(
            parseInt(process.env.CONFIG_ID as string),
        );

        //eslint-disable-next-line
        configData.levelSystem.levels.forEach((level: Level) => {
            if (
                userData.levelSystem.level - 1 == level.level &&
                level.message != undefined
            ) {
                levelText += level.message;
            }
        });
        message.member?.send(levelText).catch(() => {});
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
        const link_roles = guild_data.autoModeration.trustedLinkRoles;
        const whitelistedChannels = guild_data.autoModeration.linkChannels;

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
                await GamerBotAPIInstance.models.getUserData(
                    message.member?.id as string,
                )
            ).levelSystem.level < 2
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
