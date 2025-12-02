import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    GuildMember,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { updateLevelRoles } from "../../../functions/updateLevelRoles.js";

export default class RoleUpdate implements Command {
    name = "roleupdate";
    ephemeral = false;
    description = "Uppdatera levelrollerna för en användare";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((opt) =>
            opt
                .setName("user")
                .setDescription("Användaren som ska uppdateras")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.get("user", true)
            .member as GuildMember;
        const userData = await GamerBotAPIInstance.models.getUserData(
            user?.id as string,
        );
        updateLevelRoles(user, userData);
        interaction.editReply(`levelrollerna för ${user} har uppdaterats!`);
    }
}
