import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command.js'

/**
 * Ping command that replies with pong! and the time it took to respond.
 */
export default class PingCommand implements Command {
    constructor() {}
    name = 'ping'
    ephemeral = false
    defer = true
    description = 'Replies with pong!'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
    async execute(interaction: CommandInteraction) {
        const pining_embed = new EmbedBuilder()
            .setColor('#2DD21C')
            .setTitle(':ping_pong:  Ping')
            .setDescription(`Pingar...`)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp()
        const message = await interaction.editReply({ embeds: [pining_embed] })

        pining_embed.setDescription(
            `Tog ${message.createdTimestamp - interaction.createdTimestamp} millisekunder!`,
        )
        pining_embed.setTitle(':ping_pong:  Pong')
        interaction.editReply({ embeds: [pining_embed] })
    }
}
