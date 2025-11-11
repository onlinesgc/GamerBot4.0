import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    CommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import Ticket from "../../button_interactions/ticket.js";

export default class OpenTicketCommand implements Command {
    name = "openticket";
    ephemeral = false;
    description = "Öppna en ticket för en användare på discorden!";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill öppna en ticket för")
                .setRequired(true),
        );
    async execute(interaction: CommandInteraction) {
        const user = interaction.options.get("user", true).user;
        if (user == null)
            return interaction.editReply("Användaren finns inte!");
        await new Ticket().openTicket(
            interaction,
            user,
            `Vi har öppnat en ticket för dig! <@` +
                user.id +
                `> ! <@&1071466487069556746> kommer svara inom kort!`,
        );
        interaction.editReply(`Vi har nu öppnat en ticket för <@${user.id}>!`);
    }
}
