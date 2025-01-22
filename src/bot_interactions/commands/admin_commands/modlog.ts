import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command.js'
import { GamerBotAPIInstance } from '../../../index.js'
import { objectToModLog } from '../../../functions/moglog_functions.js'

export default class ModLogCommand implements Command {
    name = 'modlog'
    ephemeral = false
    defer = true
    description = 'Visar loggar för en användare'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen du vill se loggar för')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const user = interaction.options.get('user', true).user
        if (!user) return interaction.editReply('Användaren finns inte')

        const modlogs = (
            await GamerBotAPIInstance.models.get_profile_data(user.id)
        ).modLogs

        if (
            !modlogs &&
            !Array.isArray(modlogs) &&
            //eslint-disable-next-line
            (modlogs as Array<any>).length < 1
        )
            return interaction.editReply('Användaren har inga loggar')

        const modlog_rows = new ActionRowBuilder<ButtonBuilder>().addComponents(
            [
                new ButtonBuilder()
                    .setCustomId('modlog_previous')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('modlog_next')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Secondary),
            ],
        )
        let start_pointer = 0
        const log_count = 5

        let amount_logs_shown = modlogs.length

        if (amount_logs_shown === 0)
            return interaction.editReply('Användaren har inga loggar')

        if (amount_logs_shown <= log_count) {
            ;(modlog_rows.components[1] as ButtonBuilder).setDisabled(true)
        } else {
            amount_logs_shown = log_count
        }

        const message = await interaction.editReply({
            embeds: [
                await this.getUserModLogs(
                    modlogs,
                    interaction,
                    start_pointer,
                    log_count,
                ),
            ],
            components: [modlog_rows],
        })

        const collector = message.createMessageComponentCollector({
            time: 1000 * 60 * 5,
        })
        collector.on('collect', async (button_interaction) => {
            if (button_interaction.customId === 'modlog_previous') {
                start_pointer -= log_count
                if (start_pointer <= 0) {
                    start_pointer = 0
                    ;(modlog_rows.components[0] as ButtonBuilder).setDisabled(
                        true,
                    )
                }
                ;(modlog_rows.components[1] as ButtonBuilder).setDisabled(false)
            } else if (button_interaction.customId === 'modlog_next') {
                start_pointer += log_count
                if (start_pointer + log_count >= modlogs.length) {
                    start_pointer = modlogs.length - log_count
                    ;(modlog_rows.components[1] as ButtonBuilder).setDisabled(
                        true,
                    )
                }
                ;(modlog_rows.components[0] as ButtonBuilder).setDisabled(false)
            }
            await button_interaction.update({
                embeds: [
                    await this.getUserModLogs(
                        modlogs,
                        interaction,
                        start_pointer,
                        log_count,
                    ),
                ],
                components: [modlog_rows],
            })
        })
    }
    async getUserModLogs(
        //eslint-disable-next-line
        mod_logs: any,
        interaction: CommandInteraction,
        start: number,
        log_count: number,
    ) {
        const fields = []
        let log_counter = start
        for (const log of mod_logs.slice(start, start + log_count)) {
            const mod_log = objectToModLog(log)
            fields.push(mod_log.getEmbedField(log_counter))
            log_counter++
        }
        return new EmbedBuilder()
            .setTitle('Mod logs')
            .setDescription('Här är användarens mod logs')
            .setColor('Green')
            .addFields(fields)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp()
    }
}
