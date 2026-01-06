import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";

/**
 * Calc command that calculates a math expression.
 */
export default class CalcCommand implements Command<ChatInputCommandInteraction> {
    name = "calc";
    ephemeral = false;
    defer = true;
    description = "Räkna ut en matematisk uttryck";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("expression")
                .setDescription("Det matematiska uttrycket")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const expression = interaction.options.get("expression", false)
            ?.value as string;

        const mathEmbed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle(`${interaction.member?.user.username} | Matte tal`)
            .setDescription(`Calculating ${"`"}${expression.trim()}${"`"}`)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp();
        await interaction.editReply({ embeds: [mathEmbed] });

        fetch(
            `http://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`,
        ).then(async (data) => {
            mathEmbed.setDescription(
                `Calculated ${"`"}${expression.trim()}${"`"}\nAnswer ${"`"}${await data.text()}${"`"}`,
            );
            interaction.editReply({ embeds: [mathEmbed] });
        });
    }
}
