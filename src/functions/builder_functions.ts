import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export function CreateModLogEmbed(
    title: string,
    description: string,
    reason: string,
    command_name: string,
    interaction: CommandInteraction,
    got_message: boolean,
) {
    return new EmbedBuilder()
        .setTitle(
            title +
                " | " +
                description +
                (got_message ? "" : "\n(Personen har stängt av DMs)"),
        )
        .setDescription(`Anledning: ${reason}`)
        .setFooter({
            text: command_name,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        })
        .setTimestamp()
        .setColor("Green");
}

export function createCommandEmbed(
    title: string,
    interaction: CommandInteraction,
    discription = null,
    fields = [],
) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(discription)
        .setFields(fields)
        .setFooter({
            text: interaction.commandName,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        })
        .setTimestamp()
        .setColor("Green");
}

export function createButtonRow(...buttons : {style: ButtonStyle, label:string, id:string, emoji?:string}[]) {

    const btn_action_row = new ActionRowBuilder<ButtonBuilder>();

    buttons.forEach((button) => {
        if(!button.emoji){
            btn_action_row.addComponents(
                new ButtonBuilder()
                    .setStyle(button.style)
                    .setLabel(button.label)
                    .setCustomId(button.id)
            );
        }
        else {
            btn_action_row.addComponents(
                new ButtonBuilder()
                    .setStyle(button.style)
                    .setLabel(button.label)
                    .setCustomId(button.id)
                    .setEmoji(button.emoji)
            );
        }
    });

    return btn_action_row;
}

export function createModal(modal_title: string, modal_id: string, ...texts:{label:string,placeholder:string,style:TextInputStyle,text_id:string, requierd:boolean}[]){
    const modal = new ModalBuilder();
    modal.setTitle(modal_title);
    modal.setCustomId(modal_id);
    texts.forEach((text) => {
        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setLabel(text.label)
                    .setPlaceholder(text.placeholder)
                    .setStyle(text.style)
                    .setCustomId(text.text_id)
                    .setRequired(text.requierd)
            )
        )
    });
    return modal;
}

