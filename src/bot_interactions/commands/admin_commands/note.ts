import {
    CommandInteraction,
    GuildMember,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { ModLog } from "../../../classes/modlog";
import { CreateModLogEmbed } from "../../../functions/CreateEmbed";

export default class NoteCommand implements Command {
    name = "note";
    ephemeral = false;
    description = "Lägg till en notering på en användare";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
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
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        this.noteUser(member, reason, interaction.user.id);

        const note_embed = CreateModLogEmbed(
            "note",
            "Du har nu laggt en notering på " + member.user.username,
            this.name,
            interaction,
        );

        await interaction.reply({ embeds: [note_embed] });
    }
    async noteUser(member: GuildMember, reason: string, author_id: string) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.user.id,
        );
        const mod_log = new ModLog(
            "note",
            member.user.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            author_id,
        );

        profile_data.modLogs.push(mod_log);
        profile_data.save();
    }
}