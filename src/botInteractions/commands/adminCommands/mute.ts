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

export default class MuteCommand implements Command<ChatInputCommandInteraction> {
    name = "mute";
    ephemeral = false;
    defer = true;
    description = "Timar ut personen en viss tid.";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill muta")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till mutet")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Tid du mutar en person")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const time =
            (interaction.options.get("time", false)?.value as string) || "0";
        const hasSentMessage = await MuteCommand.mute(
            member,
            reason,
            time,
            interaction.user.id,
            `Du har blivit mutead i SGC.\nAnledningen är **${reason}**`,
        );

        const muteEmbed = createModLogEmbed(
            "mute",
            `${member.user.username} har blivit mutead i ${time}`,
            reason,
            this.name,
            interaction,
            hasSentMessage,
        );

        interaction.editReply({ embeds: [muteEmbed] });
    }
    public static async mute(
        member: GuildMember,
        reason: string,
        time: string,
        authorId: string,
        message: string,
    ) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.id,
        );

        const modLog = new ModLog(
            "mute",
            member.id,
            member.user.username,
            reason,
            time,
            Date.now(),
            authorId,
        );
        userData.modLogs.push(modLogToObject(modLog));
        userData.save();

        let hasSentMessage = true;
        await member.send(message).catch(() => {
            hasSentMessage = false;
        });
        await member.timeout(ms(time as StringValue), reason);
        return hasSentMessage;
    }
}
