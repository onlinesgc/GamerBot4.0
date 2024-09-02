import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command";
import { msToString } from "../../../functions/msToString";

/**
 * Ping command that replies with pong! and the time it took to respond.
 */
export default class UptimeCommand implements Command {
    constructor(){};
    name = "uptime";
    ephemeral = false;
    description = "Titta på hur länge boten har varit igång!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: CommandInteraction, profileData:any) {
        let currentTime = new Date().getTime();
        let restartTime = new Date(currentTime - interaction.client.uptime);
        
        const embed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle("Uptime")
            .setDescription("Här kommer upptiden för botten!")
            .setThumbnail(interaction.client.user.avatarURL())
            .addFields(
                { name: "Tid:", value: await msToString(interaction.client.uptime) },
                { name: "Totala millisekunder:", value: interaction.client.uptime.toString() },
                { name: "Omstart skedde vid:", value: restartTime.toLocaleDateString().toString() + " " + restartTime.toLocaleTimeString().toString() }
            )
            .setFooter({text:this.name,iconURL:interaction.client.user.avatarURL() as string})
            .setTimestamp()
            interaction.editReply({embeds:[embed]})
    }
}