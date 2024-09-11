import { CommandInteraction, EmbedBuilder } from "discord.js";

export function CreateModLogEmbed(
    title: string,
    description: string,
    command_name: string,
    interaction: CommandInteraction,
) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setFooter({
            text: command_name,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        })
        .setTimestamp()
        .setColor("Green");
}
