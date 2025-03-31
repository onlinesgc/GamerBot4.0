import {
    SlashCommandBuilder,
    CommandInteraction,
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
} from "discord.js";
import { PorfileData } from "gamerbot-module";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { get_emojis } from "../../../functions/emoji_counter_builder.js";

export default class FrameCommand implements Command {
    name = "frame";
    ephemeral = false;
    description = "🖼️ & 🌈";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: CommandInteraction, profileData: PorfileData) {
        const exclusive_frames = profileData.exclusiveFrames;
        const frame_config =
            await GamerBotAPIInstance.models.get_frame_config(
                "516605157795037185",
            );
        //eslint-disable-next-line
        let loaded_frames: any[] = frame_config.slice(0, 10);

        const all_exclusive_frames = frame_config.slice(
            10,
            frame_config.length,
        );

        if (exclusive_frames.length > 0) {
            loaded_frames = loaded_frames.concat(
                //eslint-disable-next-line
                all_exclusive_frames.filter((frame: any) =>
                    exclusive_frames.includes((frame.id - 10).toString()),
                ),
            );
        }

        let selected_frame = loaded_frames.findIndex(
            (frame) => frame.id.toString() === profileData.profileFrame,
        );
        let link = loaded_frames[selected_frame].frameLink;
        if (link.includes("localhost"))
            link = "https://i.imgur.com/PT8cJrF.png";

        const loaded_options = loaded_frames.map((frame, index) => {
            return { label: frame.name, value: index.toString() };
        });
        let current_side = 0;
        const embed = new EmbedBuilder()
            .setTitle("🖼️ 👇")
            .setColor("#2DD21C")
            .setImage(link)
            .setFooter({
                text: `${get_emojis(selected_frame + 1)}/${get_emojis(loaded_frames.length)} - 👈`,
            })
            .setTimestamp();
        const action_row =
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("frame_select")
                    .setPlaceholder("🖼️ 👉")
                    .addOptions(
                        await this.autoSliceSelect(
                            loaded_options,
                            current_side,
                        ),
                    ),
            );
        const color_button =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("color_select")
                    .setLabel("🌈 👈")
                    .setStyle(ButtonStyle.Success),
            );

        const message = await interaction.editReply({
            embeds: [embed],
            components: [action_row, color_button],
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
                        current_side++;
                    } else if (value === "prev") {
                        current_side = 0;
                    }
                    if (value === "prev" || value === "next") {
                        action_row.components[0].setOptions(
                            await this.autoSliceSelect(
                                loaded_options,
                                current_side,
                            ),
                        );
                        interaction.editReply({
                            components: [action_row, color_button],
                        });
                        messageComponentInteraction.deferUpdate();
                        return;
                    }

                    selected_frame = parseInt(value);
                    link = loaded_frames[selected_frame].frameLink;
                    if (link.includes("localhost"))
                        link = "https://i.imgur.com/PT8cJrF.png";

                    embed.setImage(link);
                    embed.setFooter({
                        text: `${selected_frame + 1}/${loaded_frames.length} - 🔄`,
                    });
                    interaction.editReply({ embeds: [embed] });

                    profileData.profileFrame =
                        loaded_frames[selected_frame].id.toString();
                    await profileData.save();

                    embed.setFooter({
                        text: `${selected_frame + 1}/${loaded_frames.length} - ✅`,
                    });
                    interaction.editReply({ embeds: [embed] });

                    messageComponentInteraction.deferUpdate();
                } else if (
                    messageComponentInteraction.customId === "color_select"
                ) {
                    const color_modal = new ModalBuilder()
                        .setTitle("🌈 👈")
                        .setCustomId(`color:${messageComponentInteraction.id}`)
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(
                                new TextInputBuilder()
                                    .setCustomId("hex")
                                    .setLabel("# 👈")
                                    .setStyle(TextInputStyle.Short),
                            ),
                        );

                    await messageComponentInteraction.showModal(color_modal);

                    messageComponentInteraction
                        .awaitModalSubmit({ time: 1000 * 60 * 5 })
                        .then(async (modal) => {
                            const hex = modal.fields.getTextInputValue("hex");
                            if (!hex.match(/^#[0-9A-F]{6}$/i)) {
                                await modal.reply("# 👈 ❌");
                                return;
                            }
                            profileData.colorHexCode = hex;
                            await profileData.save();
                            await modal.reply("# 👈 ✅");
                        })
                        .catch(async () => {});
                }
                GamerBotAPIInstance.models.get_user_frame(
                    interaction.user.id,
                    interaction.user.username,
                    interaction.user.avatarURL({ extension: "png" }) as string,
                    true,
                );
            },
        );

        collector.on("end", async () => {
            embed.setFooter({
                text: `${selected_frame + 1}/${loaded_frames.length} - ⌛ ❌`,
            });
            interaction.editReply({ embeds: [embed], components: [] });
        });
    }
    async autoSliceSelect(
        loaded_frames: { label: string; value: string }[],
        sliced_side: number,
    ) {
        let sliced_frames = loaded_frames.slice(
            sliced_side * 24,
            loaded_frames.length,
        );
        if (sliced_frames.length >= 24) {
            sliced_frames = sliced_frames.slice(0, 24);
            sliced_frames.push({ label: "👉", value: "next" });
        } else if (sliced_frames.length < 24 && sliced_side > 0) {
            sliced_frames.push({ label: "👈", value: "prev" });
        }
        return sliced_frames;
    }
}
