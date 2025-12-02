import {
    ActionRowBuilder,
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { Command } from "../../../classes/command.js";

export default class EditMessageCommand implements Command {
    name = "edit";
    ephemeral = false;
    description = "Edit a message";
    aliases = [];
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption((option) =>
            option
                .setName("message_id")
                .setDescription("The message id")
                .setRequired(true),
        )
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("The channel where the message is")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const messageId = interaction.options.get("message_id", true)
            .value as string;
        const channel = interaction.options.get("channel", true)
            .channel as BaseGuildTextChannel;

        const message = await channel.messages.fetch(messageId);

        const modal = new ModalBuilder()
            .setTitle("Edit message")
            .setCustomId(`send_message:${interaction.id}`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setLabel("Ändra här:")
                        .setStyle(TextInputStyle.Paragraph)
                        .setCustomId(`send_message_message`)
                        .setValue(message.content),
                ),
            );
        await interaction.showModal(modal);
        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;
        interaction
            .awaitModalSubmit({ filter, time: 1000 * 60 * 10 })
            .then(async (modalSubmit) => {
                const newContent = modalSubmit.fields.getTextInputValue(
                    "send_message_message",
                );
                await message.edit(newContent);
                await modalSubmit.reply(`Message edited in ${channel}`);
            });
    }
}
