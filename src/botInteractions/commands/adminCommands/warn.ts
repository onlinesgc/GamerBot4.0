import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { ModLog } from "../../../classes/modlog.js";
import { createModLogEmbed } from "../../../functions/builderFunctions.js";

export default class WarnCommand implements Command<ChatInputCommandInteraction> {
    name = "warn";
    ephemeral = false;
    defer = true;
    description = "Varna en person!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill varna")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till varningen")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const hasSentMessage = await this.warn(
            member,
            reason,
            interaction.user.id,
        );

        const warnEmbed = createModLogEmbed(
            "warn",
            `${member.user.username} har blivit varnad`,
            reason,
            this.name,
            interaction,
            hasSentMessage,
        );

        await interaction.editReply({ embeds: [warnEmbed] });
    }
    async warn(member: GuildMember, reason: string, authorId: string) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.user.id,
        );

        const modLog = new ModLog(
            "warn",
            member.user.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            authorId,
        );
        userData.modLogs.push(modLog);
        userData.save();

        let hasSentMessage = true;

        await member
            .send(
                `Du har fått en regelpåminnelse från SGC.\nPåminnelsen lyder: **${reason}**`,
            )
            .catch(() => (hasSentMessage = false));

        return hasSentMessage;
    }
}
