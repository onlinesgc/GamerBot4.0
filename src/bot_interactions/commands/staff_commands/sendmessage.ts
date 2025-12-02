import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    GuildTextBasedChannel,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextInputStyle,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { createModal } from "../../../functions/builder_functions.js";

export default class SendMessageCommand implements Command {
    name = "sendmessage";
    ephemeral = false;
    description = "Skicka ett meddelande till en användare!";
    aliases = [];
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Kanalen du vill skicka meddelandet i")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("options")
                .setDescription("Add buttons [name-customID]")
                .setRequired(false),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.get("channel", true)
            .channel as GuildTextBasedChannel;
        const options = interaction.options.get("options", false)
            ?.value as string;


        const messageModal = createModal(
            "Skicka meddelande",
            `send_message:${interaction.id}`,
            {
                label: "Meddelande:",
                placeholder: "Skriv här...",
                style: TextInputStyle.Paragraph,
                textId: "send_message_message",
                requierd: true,
            }
        );

        await interaction.showModal(messageModal);
        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;
        const modalSubmit = await interaction.awaitModalSubmit({ filter, time: 1000 * 60 * 10 }).catch(() => {});

        if (!modalSubmit) return;

        const message = modalSubmit.fields.getTextInputValue(
            "send_message_message",
        );
        
        if (options) {
            const buttonRow =
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(options.split("-")[1])
                        .setLabel(options.split("-")[0]),
                );
            await channel.send({
                content: message,
                components: [buttonRow],
            });
        } else await channel.send(message);

        modalSubmit.deferUpdate();
    }
}
