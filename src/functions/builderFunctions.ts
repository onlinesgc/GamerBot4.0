import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export function CreateModLogEmbed(
    title: string,
    description: string,
    reason: string,
    commandName: string,
    interaction: CommandInteraction,
    gotMessage: boolean,
) {
    return new EmbedBuilder()
        .setTitle(
            title +
                " | " +
                description +
                (gotMessage ? "" : "\n(Personen har stängt av DMs)"),
        )
        .setDescription(`Anledning: ${reason}`)
        .setFooter({
            text: commandName,
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

    const btnActionRow = new ActionRowBuilder<ButtonBuilder>();

    buttons.forEach((button) => {
        if(!button.emoji){
            btnActionRow.addComponents(
                new ButtonBuilder()
                    .setStyle(button.style)
                    .setLabel(button.label)
                    .setCustomId(button.id)
            );
        }
        else {
            btnActionRow.addComponents(
                new ButtonBuilder()
                    .setStyle(button.style)
                    .setLabel(button.label)
                    .setCustomId(button.id)
                    .setEmoji(button.emoji)
            );
        }
    });

    return btnActionRow;
}

export function createModal(modalTitle: string, modalId: string, ...texts:{label:string,placeholder:string,style:TextInputStyle,textId:string, requierd:boolean}[]){
    const modal = new ModalBuilder();
    modal.setTitle(modalTitle);
    modal.setCustomId(modalId);
    texts.forEach((text) => {
        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setLabel(text.label)
                    .setPlaceholder(text.placeholder)
                    .setStyle(text.style)
                    .setCustomId(text.textId)
                    .setRequired(text.requierd)
            )
        )
    });
    return modal;
}

