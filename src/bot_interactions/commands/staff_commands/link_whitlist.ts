import {
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'
import { GamerBotAPIInstance } from '../../..'

export default class LinkWhitelistCommand implements Command {
    name = 'linkwhitelist'
    ephemeral = false
    defer = true
    description = 'Lägg till en länk till whitelisten'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName('link')
                .setDescription('Länken som ska läggas till')
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    async execute(interaction: CommandInteraction) {
        const link = interaction.options.get('link', true).value as string
        const guild_config = await GamerBotAPIInstance.models.get_guild_data(
            interaction.guildId as string,
        )
        const new_link = { linkPrefix: link }
        guild_config.whitelistedLinks.push(new_link)
        guild_config.save()
        interaction.editReply('Länken har lagts till i whitelisten!')
    }
}
