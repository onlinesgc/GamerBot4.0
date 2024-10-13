import {
    AutocompleteInteraction,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js'
import { Command } from '../../../classes/command'
import { GamerBotAPIInstance, GamerbotClient } from '../../..'
import { getAllFrames } from '../../../functions/getAllFrames'

export default class GiveFrameCommand implements Command {
    name = 'giveframe'
    ephemeral = false
    description = 'Give a frame to a user'
    aliases = []
    defer = true
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to give the frame to')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('frame')
                .setDescription('The frame to give')
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName('action')
                .setDescription('The action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' },
                ),
        )
    async execute(interaction: CommandInteraction) {
        const user = interaction.options.get('user', true).user
        const frame = interaction.options.get('frame', true).value as string
        const action = interaction.options.get('action', true).value as string

        const frame_config = (
            await GamerBotAPIInstance.models.get_guild_data(
                '516605157795037185',
            )
        ).frameConfig
        const frame_data = frame_config.find(
            //eslint-disable-next-line
            (f: any) => f.id.toString() === frame,
        )
        if (frame_data === undefined) {
            interaction.editReply('Frame not found')
            return
        }
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            user?.id as string,
        )
        const exclusive_frame_id = (parseInt(frame) - 10).toString()
        if (action === 'add') {
            if (profile_data.exclusiveFrames.includes(exclusive_frame_id)) {
                interaction.editReply('User already has the frame')
                return
            }
            profile_data.exclusiveFrames.push(exclusive_frame_id)
        } else {
            if (!profile_data.exclusiveFrames.includes(exclusive_frame_id)) {
                interaction.editReply('User does not have the frame')
                return
            }
            profile_data.exclusiveFrames = profile_data.exclusiveFrames.map(
                //eslint-disable-next-line
                (f: any) => f.toString(),
            )
            profile_data.exclusiveFrames = profile_data.exclusiveFrames.filter(
                (f) => f !== exclusive_frame_id,
            )
        }
        profile_data.save()
        interaction.editReply('Frame added/removed')
    }

    async autoComplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused(true)
        if (focusedValue === null) {
            return
        }
        let choises = await getAllFrames(
            '516605157795037185',
            interaction.client as GamerbotClient,
        )
        choises = choises.slice(10, choises.length)
        const filtered = choises.filter((choise) =>
            choise.name.includes(focusedValue.value),
        )

        let options
        if (filtered.length > 25) {
            options = filtered.slice(0, 25)
        } else {
            options = filtered
        }

        await interaction.respond(options)
    }
}
