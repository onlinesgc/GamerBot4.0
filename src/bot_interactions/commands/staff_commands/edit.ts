import { ActionRowBuilder, BaseGuildTextChannel, CommandInteraction, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../../../classes/command";

export default class EditMessageCommand implements Command {
    name = "edit";
    ephemeral = false;
    description = "Edit a message";
    aliases = [];
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        //.addBooleanOption((option) => option.setName("formated").setDescription("Get formated message").setRequired(true))
        .addStringOption((option) =>
            option
                .setName("message_id")
                .setDescription("The message id")
                .setRequired(true),
        )
        .addChannelOption((option) =>option.setName("channel").setDescription("The channel where the message is").setRequired(true));
    async execute(interaction: CommandInteraction) {
        const message_id = interaction.options.get("message_id", true).value as string;
        const channel = interaction.options.get("channel", true).channel as BaseGuildTextChannel;
        //const formated = interaction.options.get("formated", true).value as boolean;

        const message = await channel.messages.fetch(message_id);
        /*
        if(formated){
            return interaction.editReply("```"+message.content+"```")
        }
        */

        const modal = new ModalBuilder()
            .setTitle("Edit message")
            .setCustomId(`send_message:${interaction.id}`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .addComponents(
                        new TextInputBuilder()
                            .setLabel("Ändra här:")
                            .setStyle(TextInputStyle.Paragraph)
                            .setCustomId(`send_message_message`)
                            .setValue(message.content)
                    )
            )
        await interaction.showModal(modal);
        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;
        interaction.awaitModalSubmit({filter,time: 1000 * 60 * 10}).then(async (modal_submit) => {
            const new_content = modal_submit.fields.getTextInputValue("send_message_message");
            await message.edit(new_content);
            await modal_submit.reply(`Message edited in ${channel}`);
        });
    }
}