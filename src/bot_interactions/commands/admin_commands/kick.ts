import {
    SlashCommandBuilder,
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { ModLog } from "../../../classes/modlog";
import { CreateModLogEmbed } from "../../../functions/createEmbed";

export default class KickCommand implements Command {
    name = "kick";
    ephemeral = false;
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
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const has_sent_message = await this.kick(
            member,
            reason,
            interaction.user.id,
        );

        const kick_embed = CreateModLogEmbed(
            "kick",
            `${member.user.username} har blivit kickad`,
            reason,
            this.name,
            interaction,
            has_sent_message
        );

        await interaction.editReply({ embeds: [kick_embed] });
    }
    async kick(member: GuildMember, reason: string, author_id: string) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.user.id,
        );

        const mod_log = new ModLog(
            "kick",
            member.user.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            author_id,
        );
        profile_data.modLogs.push(mod_log);
        profile_data.save();

        let has_sent_message = true;
        await member
            .send(
                `Du har blivit kickad från SGC,\nAnledningen är **${reason}**`,
            )
            .catch(() => (has_sent_message = false));
        member.kick(reason);
        return has_sent_message;
    }
}
