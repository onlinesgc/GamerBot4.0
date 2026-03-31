import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { msToString } from "../../../functions/msToString.js";

/**
 * Ping command that replies with pong! and the time it took to respond.
 */
export default class UptimeCommand implements Command<ChatInputCommandInteraction> {
    constructor() {}
    name = "uptime";
    ephemeral = false;
    defer = true;
    description = "Regardez depuis combien de temps le bot fonctionne !";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction) {
        const currentTime = new Date().getTime();
        const restartTime = new Date(currentTime - interaction.client.uptime);

        const embed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle("Uptime")
            .setDescription("Voici venu le moment du fond !")
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
                {
                    name: "Temps:",
                    value: await msToString(interaction.client.uptime),
                },
                {
                    name: "Nombre total de millisecondes :",
                    value: interaction.client.uptime.toString(),
                },
                {
                    name: "Le redémarrage a eu lieu à :",
                    value:
                        restartTime.toLocaleDateString().toString() +
                        " " +
                        restartTime.toLocaleTimeString().toString(),
                },
            )
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL() as string,
            })
            .setTimestamp();
        interaction.editReply({ embeds: [embed] });
    }
}
