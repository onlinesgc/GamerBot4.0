import {
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'
import { GamerBotAPIInstance } from '../../..'
import { ModLog } from '../../../classes/modlog'
import { CreateModLogEmbed } from '../../../functions/createEmbed'

export default class UnMuteCommand implements Command {
    name = 'unmute'
    ephemeral = false
    defer = true
    description = 'Unmutar en användare'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen du vill unmuta')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('Anledning till unmutet')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get('user', true)
            .member as GuildMember
        const reason = interaction.options.get('reason', true).value as string

        if (!member) return interaction.editReply('Användaren finns inte')

        const has_sent_message = await this.unMute(
            member,
            reason,
            interaction.user.id,
        )

        const embed = CreateModLogEmbed(
            'unmute',
            `${member.user.username} har unmutats`,
            reason,
            this.name,
            interaction,
            has_sent_message,
        )

        interaction.editReply({ embeds: [embed] })
    }
    async unMute(member: GuildMember, reason: string, authorId: string) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        )
        const modlog = new ModLog(
            'unmute',
            member.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            authorId,
        )

        profile_data.modLogs.push(modlog)
        profile_data.save()

        let has_sent_message = true

        await member
            .send(`Du har blivit unmutad i SGC.\nAnledningen är **${reason}**`)
            .catch(() => (has_sent_message = false))

        member.timeout(null)

        return has_sent_message
    }
}
