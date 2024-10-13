import { CommandInteraction, EmbedBuilder } from 'discord.js'

export function CreateModLogEmbed(
    title: string,
    description: string,
    reason: string,
    command_name: string,
    interaction: CommandInteraction,
    got_message: boolean,
) {
    return new EmbedBuilder()
        .setTitle(
            title +
                ' | ' +
                description +
                (got_message ? '' : '\n(Personen har stängt av DMs)'),
        )
        .setDescription(`Anledning: ${reason}`)
        .setFooter({
            text: command_name,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        })
        .setTimestamp()
        .setColor('Green')
}

export function createCommandEmbed(
    title: string,
    interaction: CommandInteraction,
    discription = null,
    fields = [],
) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(discription)
        .setFields(fields)
        .setFooter({
            text: interaction.commandName,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        })
        .setTimestamp()
        .setColor('Green')
}
