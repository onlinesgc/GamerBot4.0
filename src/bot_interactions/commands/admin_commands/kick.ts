import {
    SlashCommandBuilder,
    GuildMember,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { ModLog } from "../../../classes/modlog.js";
import { CreateModLogEmbed } from "../../../functions/builder_functions.js";

export default class KickCommand implements Command {
    name = "kick";
    ephemeral = false;
    defer = true;
    description = "Kicka en person från servern!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill kicka")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till kicket")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const hasSentMessage = await this.kick(
            member,
            reason,
            interaction.user.id,
        );

        const kickEmbed = CreateModLogEmbed(
            "kick",
            `${member.user.username} har blivit kickad`,
            reason,
            this.name,
            interaction,
            hasSentMessage,
        );

        await interaction.editReply({ embeds: [kickEmbed] });
    }
    async kick(member: GuildMember, reason: string, authorId: string) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.user.id,
        );

        const modLog = new ModLog(
            "kick",
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
                `Du har blivit kickad från SGC,\nAnledningen är **${reason}**`,
            )
            .catch(() => (hasSentMessage = false));
        member.kick(reason);
        return hasSentMessage;
    }
}
