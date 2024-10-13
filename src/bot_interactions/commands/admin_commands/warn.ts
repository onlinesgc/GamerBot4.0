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

export default class WarnCommand implements Command {
    name = 'warn'
    ephemeral = false
    defer = true
    description = 'Varna en person!'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen du vill varna')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('Anledning till varningen')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get('user', true)
            .member as GuildMember
        const reason = interaction.options.get('reason', true).value as string
        const has_sent_message = await this.warn(
            member,
            reason,
            interaction.user.id,
        )

        const warn_embed = CreateModLogEmbed(
            'warn',
            `${member.user.username} har blivit varnad`,
            reason,
            this.name,
            interaction,
            has_sent_message,
        )

        await interaction.editReply({ embeds: [warn_embed] })
    }
    async warn(member: GuildMember, reason: string, author_id: string) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.user.id,
        )

        const mod_log = new ModLog(
            'warn',
            member.user.id,
            member.user.username,
            reason,
            null,
            Date.now(),
            author_id,
        )
        profile_data.modLogs.push(mod_log)
        profile_data.save()

        let has_sent_message = true

        await member
            .send(
                `Du har fått en regelpåminnelse från SGC.\nPåminnelsen lyder: **${reason}**`,
            )
            .catch(() => (has_sent_message = false))

        return has_sent_message
    }
}
