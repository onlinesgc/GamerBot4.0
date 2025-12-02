import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { ModLog } from "../../../classes/modlog.js";
import { CreateModLogEmbed } from "../../../functions/builder_functions.js";

export default class UnMuteCommand implements Command {
    name = "unmute";
    ephemeral = false;
    defer = true;
    description = "Unmutar en användare";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill unmuta")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till unmutet")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;

        if (!member) return interaction.editReply("Användaren finns inte");

        const hasSentMessage = await this.unMute(
            member,
            reason,
            interaction.user.id,
        );

        const embed = CreateModLogEmbed(
            "unmute",
            `${member.user.username} har unmutats`,
            reason,
            this.name,
            interaction,
            hasSentMessage,
        );

        interaction.editReply({ embeds: [embed] });
    }
    async unMute(member: GuildMember, reason: string, authorId: string) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.id,
        );
        const modlog = new ModLog(
            "unmute",
            member.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            authorId,
        );

        userData.modLogs.push(modlog);
        userData.save();

        let hasSentMessage = true;

        await member
            .send(`Du har blivit unmutad i SGC.\nAnledningen är **${reason}**`)
            .catch(() => (hasSentMessage = false));

        member.timeout(null);

        return hasSentMessage;
    }
}
