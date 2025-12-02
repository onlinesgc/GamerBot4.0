import {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuInteraction,
    MessageComponentInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ChatInputCommandInteraction,
} from "discord.js";
import { UserData } from "gamerbot-module";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";

export default class FrameCommand implements Command {
    name = "frame";
    ephemeral = false;
    description = "Ändra på din ram och bakgrundsfärg";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction, userData: UserData) {
        const frames = userData.frameData.frames;
        const frameConfig = await GamerBotAPIInstance.models.getFrameConfig();

        const loadedFrames = frameConfig.filter((frame) => frames.includes(frame.id.toString()))

        let selectedFrame = userData.frameData.selectedFrame;

        let link = loadedFrames[selectedFrame].frameLink;

        if (link.includes("localhost"))
            link = "https://i.imgur.com/PT8cJrF.png";

        const loadedOptions = loadedFrames.map((frame, index) => {
            return { label: frame.name, value: index.toString() };
        });

        let currentSide = 0;

        const embed = new EmbedBuilder()
            .setTitle("Du kan välja ram igenom menyn nedan")
            .setColor("#2DD21C")
            .setImage(link)
            .setFooter({
                text: `${selectedFrame + 1}/${loadedFrames.length} - Nuvarande ram`,
            })
            .setTimestamp();
        const actionRow =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("frame_select")
                    .setPlaceholder("Välj ram")
                    .addOptions(
                        await this.autoSliceSelect(
                            loadedOptions,
                            currentSide,
                        ),
                    ),
            );
        const colorButton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("color_select")
                    .setLabel("Välj färg")
                    .setStyle(ButtonStyle.Success),
            );

        const message = await interaction.editReply({
            embeds: [embed],
            components: [actionRow, colorButton],
        });

        const filter = (i: MessageComponentInteraction) =>
            i.customId === "frame_select" || i.customId === "color_select";

        const collector = message.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * 5,
        });

        collector.on(
            "collect",
            async (
                messageComponentInteraction: MessageComponentInteraction,
            ) => {
                if (
                    messageComponentInteraction.user.id !=
                    messageComponentInteraction.member?.user.id
                )
                    return;

                if (messageComponentInteraction.customId === "frame_select") {
                    const value = (
                        messageComponentInteraction as StringSelectMenuInteraction
                    ).values[0];
                    if (value === "next") {
                        currentSide++;
                    } else if (value === "prev") {
                        currentSide = 0;
                    }
                    if (value === "prev" || value === "next") {
                        actionRow.components[0].setOptions(
                            await this.autoSliceSelect(
                                loadedOptions,
                                currentSide,
                            ),
                        );
                        interaction.editReply({
                            components: [actionRow, colorButton],
                        });
                        messageComponentInteraction.deferUpdate();
                        return;
                    }

                    selectedFrame = parseInt(value);
                    link = loadedFrames[selectedFrame].frameLink;
                    if (link.includes("localhost"))
                        link = "https://i.imgur.com/PT8cJrF.png";

                    embed.setImage(link);
                    embed.setFooter({
                        text: `${selectedFrame + 1}/${loadedFrames.length} - Sparar...`,
                    });
                    interaction.editReply({ embeds: [embed] });

                    userData.frameData.selectedFrame = loadedFrames[selectedFrame].id;
                    await userData.save();

                    embed.setFooter({
                        text: `${selectedFrame + 1}/${loadedFrames.length} - Sparat`,
                    });
                    interaction.editReply({ embeds: [embed] });

                    messageComponentInteraction.deferUpdate();
                } else if (
                    messageComponentInteraction.customId === "color_select"
                ) {
                    const colorModal = new ModalBuilder()
                        .setTitle("Välj färg")
                        .setCustomId(`color:${messageComponentInteraction.id}`)
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("hex")
                                    .setLabel("Skriv din hex kod här")
                                    .setStyle(TextInputStyle.Short),
                            ),
                        );

                    await messageComponentInteraction.showModal(colorModal);

                    messageComponentInteraction
                        .awaitModalSubmit({ time: 1000 * 60 * 5 })
                        .then(async (modal) => {
                            const hex = modal.fields.getTextInputValue("hex");
                            if (!hex.match(/^#[0-9A-F]{6}$/i)) {
                                await modal.reply("Fel format på hex koden");
                                return;
                            }
                            userData.frameData.frameColorHexCode = hex;
                            await userData.save();
                            await modal.reply("Färg sparad");
                        })
                        .catch(async () => {});
                }
            },
        );

        collector.on("end", async () => {
            embed.setFooter({
                text: `${selectedFrame + 1}/${loadedFrames.length} - Timeout`,
            });
            interaction.editReply({ embeds: [embed], components: [] });
        });
    }
    async autoSliceSelect(
        loadedFrames: { label: string; value: string }[],
        slicedSide: number,
    ) {
        let slicedFrames = loadedFrames.slice(
            slicedSide * 24,
            loadedFrames.length,
        );
        if (slicedFrames.length >= 24) {
            slicedFrames = slicedFrames.slice(0, 24);
            slicedFrames.push({ label: "Nästa sida", value: "next" });
        } else if (slicedFrames.length < 24 && slicedSide > 0) {
            slicedFrames.push({ label: "Första sidan", value: "prev" });
        }
        return slicedFrames;
    }
}
