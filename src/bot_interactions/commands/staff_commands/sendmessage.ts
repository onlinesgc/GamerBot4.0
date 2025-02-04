import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    GuildTextBasedChannel,
    ModalBuilder,
    ModalSubmitInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { Command } from "../../../classes/command.js";

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
    async execute(interaction: CommandInteraction) {
        const channel = interaction.options.get("channel", true)
            .channel as GuildTextBasedChannel;
        const options = interaction.options.get("options", false)
            ?.value as string;

        const message_modal = new ModalBuilder()
            .setTitle("Skicka meddelande")
            .setCustomId(`send_message:${interaction.id}`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setLabel("Meddelande:")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder("Skriv här...")
                        .setCustomId("send_message_message"),
                ),
            );

        await interaction.showModal(message_modal);
        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;
        interaction
            .awaitModalSubmit({ filter, time: 1000 * 60 * 10 })
            .then(async (modal_submit) => {
                const message = modal_submit.fields.getTextInputValue(
                    "send_message_message",
                );
                if (options) {
                    const button_row =
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Success)
                                .setCustomId(options.split("-")[1])
                                .setLabel(options.split("-")[0]),
                        );
                    await channel.send({
                        content: message,
                        components: [button_row],
                    });
                } else await channel.send(message);

                modal_submit.deferUpdate();
            });
    }
}
