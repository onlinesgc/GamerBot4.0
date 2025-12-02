import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { ModLog } from "../../../classes/modlog.js";
import { modLogToObject } from "../../../functions/moglogFunctions.js";
import ms, { StringValue } from "ms";
import { createModLogEmbed } from "../../../functions/builderFunctions.js";

export default class BanCommand implements Command {
    name = "ban";
    ephemeral = false;
    defer = true;
    description = "Banna en person från sereven!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill banna")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till bannet")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Tid du banar en person")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("messages")
                .setDescription(
                    "Alla meddelanden innom tiden kommer att raderas (1d tex)",
                )
                .setRequired(false),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const time = (interaction.options.get("time", false)?.value as string) || "0";
        const messages = (interaction.options.get("messages", false)?.value as string) || "0s";

        const hasSentMessage = await this.banUser(
            member,
            reason,
            time,
            interaction.user.id,
            messages,
        );
        const banEmbed = createModLogEmbed(
            "Ban",
            `${member.user.username} har blivit bannad`,
            reason,
            this.name,
            interaction,
            hasSentMessage,
        );

        interaction.editReply({
            embeds: [banEmbed],
        });
    }

    async banUser(
        member: GuildMember,
        reason: string,
        time: string,
        authorId: string,
        messages: string,
    ) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.id,
        );
        const modLog = new ModLog(
            "ban",
            member.id,
            member.user.username,
            reason,
            time,
            Date.now(),
            authorId,
        );
        userData.modLogs.push(modLogToObject(modLog));
        await userData.save();
        let hasSentMessage = true;
        await member
            .send(
                time == "0"
                    ? `Du har blivit bannad från SGC.\nAnledningen är **${reason}**`
                    : `Du har blivit bannad från SGC i ${time}.\nAnledningen är **${reason}**`,
            )
            .catch(() => {
                hasSentMessage = false;
            });
        if (time != "0") {
            const guildData =
                await GamerBotAPIInstance.models.getGuildData(
                    member.guild.id,
                );
            guildData.autoModeration.bannedUsers.push({
                userID: member.id,
                unbantime: Number(Date.now() + ms(time as StringValue)),
            });
            guildData.save();
        }
        await member.guild.bans.create(member.id, {
            reason: reason,
            deleteMessageSeconds: ms(messages as StringValue) / 1000,
        });
        return hasSentMessage;
    }
}
