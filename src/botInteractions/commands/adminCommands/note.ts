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

export default class NoteCommand implements Command {
    name = "note";
    ephemeral = false;
    defer = true;
    description = "Lägg till en notering på en användare";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill lägga till en notering på")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till noteringen")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        this.noteUser(member, reason, interaction.user.id);

        const noteEmbed = createModLogEmbed(
            "note",
            "Du har nu laggt en notering på " + member.user.username,
            reason,
            this.name,
            interaction,
            true,
        );

        await interaction.editReply({ embeds: [noteEmbed] });
    }
    async noteUser(member: GuildMember, reason: string, authorId: string) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.user.id,
        );
        const modLog = new ModLog(
            "note",
            member.user.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            authorId,
        );

        userData.modLogs.push(modLog);
        userData.save();
    }
}
