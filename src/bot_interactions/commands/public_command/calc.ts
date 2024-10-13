import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'

/**
 * Calc command that calculates a math expression.
 */
export default class CalcCommand implements Command {
    name = 'calc'
    ephemeral = false
    defer = true
    description = 'Räkna ut en matematisk uttryck'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName('expression')
                .setDescription('Det matematiska uttrycket')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const expression = interaction.options.get('expression', false)
            ?.value as string

        const math_embed = new EmbedBuilder()
            .setColor('#2DD21C')
            .setTitle(`${interaction.member?.user.username} | Matte tal`)
            .setDescription(`Calculating ${'`'}${expression.trim()}${'`'}`)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp()
        await interaction.editReply({ embeds: [math_embed] })

        fetch(
            `http://api.mathjs.org/v4/?expr=${encodeURIComponent(expression)}`,
        ).then(async (data) => {
            math_embed.setDescription(
                `Calculated ${'`'}${expression.trim()}${'`'}\nAnswer ${'`'}${await data.text()}${'`'}`,
            )
            interaction.editReply({ embeds: [math_embed] })
        })
    }
}
