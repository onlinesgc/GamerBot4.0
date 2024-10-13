import {
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'
import MuteCommand from './mute'
import { CreateModLogEmbed } from '../../../functions/createEmbed'

export default class EmuteCommand implements Command {
    name = 'emute'
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
                .setRequired(true)
                .addChoices(
                    { name: 'short', value: '1h' },
                    { name: 'standard', value: '8h' },
                    { name: 'long', value: '20h' },
                ),
        )
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get('user', true)
            .member as GuildMember
        const reason = interaction.options.get('reason', true).value as string
        const time =
            (interaction.options.get('time', true).value as string) || '0'
        const has_sent_message = await MuteCommand.mute(
            member,
            reason,
            time,
            interaction.user.id,
            `Du har blivit tystad i SGC.\n**Du är jättevälkommen tillbaka igen efter ${time}. Kom ihåg respektera alla på servern och lyssna på staffsens regelpåminnelser.**`,
        )

        const mute_embed = CreateModLogEmbed(
            'mute',
            `${member.user.username} har blivit tystad i ${time}`,
            reason,
            this.name,
            interaction,
            has_sent_message,
        )
        await interaction.editReply({ embeds: [mute_embed] })
    }
}
