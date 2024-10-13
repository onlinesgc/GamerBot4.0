import {
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'
import { GamerBotAPIInstance } from '../../..'
import { ModLog } from '../../../classes/modlog'
import { modLogToObject } from '../../../functions/moglog_functions'
import ms from 'ms'
import { CreateModLogEmbed } from '../../../functions/createEmbed'

export default class MuteCommand implements Command {
    name = 'mute'
    ephemeral = false
    defer = true
    description = 'Timar ut personen en viss tid.'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen du vill muta')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('reason')
                .setDescription('Anledning till mutet')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('time')
                .setDescription('Tid du mutar en person')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get('user', true)
            .member as GuildMember
        const reason = interaction.options.get('reason', true).value as string
        const time =
            (interaction.options.get('time', false)?.value as string) || '0'
        const has_sent_message = await MuteCommand.mute(
            member,
            reason,
            time,
            interaction.user.id,
            `Du har blivit mutead i SGC.\nAnledningen är **${reason}**`,
        )

        const mute_embed = CreateModLogEmbed(
            'mute',
            `${member.user.username} har blivit mutead i ${time}`,
            reason,
            this.name,
            interaction,
            has_sent_message,
        )

        interaction.editReply({ embeds: [mute_embed] })
    }
    public static async mute(
        member: GuildMember,
        reason: string,
        time: string,
        authorId: string,
        message: string,
    ) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        )

        const mod_log = new ModLog(
            'mute',
            member.id,
            member.user.username,
            reason,
            time,
            Date.now(),
            authorId,
        )
        profile_data.modLogs.push(modLogToObject(mod_log))
        profile_data.save()

        let has_sent_message = true
        await member.send(message).catch(() => {
            has_sent_message = false
        })
        await member.timeout(ms(time), reason)
        return has_sent_message
    }
}
