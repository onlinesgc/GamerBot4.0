import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { Command } from "../../../classes/command.js";

export default class Maintenance implements Command<ChatInputCommandInteraction> {
    name = "maintenance";
    ephemeral = false;
    defer = true;
    description = "Slå på eller av maintenance mode";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((opt) =>
            opt
                .setName("status")
                .setDescription("välj status för GaymerBot & Pixel Displayen")
                .setRequired(true)
                .addChoices(
                    { name: "off", value: "off" },
                    { name: "on", value: "on" },
                ),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    async execute(interaction: ChatInputCommandInteraction) {
        const status = interaction.options.get("status", true).value as string;
        interaction.editReply(
            `Maintenance mode är nu ${status == "on" ? "på" : "av"}`,
        );

        const title = `GamerBot ${status == "on" ? "Offline" : "Online"}!`;
        const description =
            status == "on"
                ? "Bleep Bloop, nu kommer jag, GamerBot att bli offline ett tag för att saker behöver fixas. Även Pixeldisplayen och eventuella andra saker som hostas av SGC kan påverkas av detta. Detta är planerat så ni behöver inte kontakta mods. Jag kommer snart tillbaka!"
                : "Bleep Bloop, GamerBot tillbaka online igen! Allt som hostas av SGC ska fungera som vanligt igen. Tack för ert tålamod!";
        const pixelTitle = `Pixel Display ${status == "on" ? "Offline" : "Online"}!`;
        const pixelDescription =
            status == "on"
                ? "Nu är Pixel Displayen offline ett tag för att saker behöver fixas. Detta är planerat så ni behöver inte kontakta mods. Den kommer snart tillbaka!"
                : "Nu är Pixel Displayen tillbaka online igen! Tack för ert tålamod!";

        const channel = interaction.guild?.channels.cache.get(
            "822546907007811585",
        ) as TextChannel;
        const pixelChannel = interaction.guild?.channels.cache.get(
            "1124635360165638235",
        ) as TextChannel;

        if (channel == null || pixelChannel == null)
            return interaction.editReply("Kan inte hitta kanalerna");

        const embed = new EmbedBuilder()
            .setTitle(`${title}`)
            .setColor("#2DD21C")
            .setDescription(description);

        channel.send({ embeds: [embed] });

        const pixelEmbed = new EmbedBuilder()
            .setTitle(`${pixelTitle}`)
            .setColor("#2DD21C")
            .setDescription(pixelDescription);

        pixelChannel.send({ embeds: [pixelEmbed] });
    }
}
