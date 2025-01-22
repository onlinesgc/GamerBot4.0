import {
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    PresenceStatus,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command.js'
import { EmbedBuilder } from '@discordjs/builders'

export default class UserInfoCommand implements Command {
    name = 'userinfo'
    ephemeral = false
    defer = true
    description = 'Hämta information om en användare'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen du vill hämta information om')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get('user', true)
            .member as GuildMember

        const roles = member.roles.cache
            .filter((role) => role.id !== interaction.guild?.id)
            .map((role) => role.toString())
            .join(', ')

        const embed = new EmbedBuilder()
            .setTitle('Användarinformation | ' + member.user.username)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Användarnamn', value: member.user.username },
                { name: 'ID', value: member.id },
                {
                    name: 'Status',
                    value: member.presence?.status as PresenceStatus,
                },
                { name: 'Roller', value: roles || 'Inga roller' },
            )
            .setTimestamp()
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })

        await interaction.editReply({ embeds: [embed] })
    }
}
