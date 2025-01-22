import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";

export default class GiveEventXp implements Command {
    name = 'giveeventxp'
    description = 'Ge xp till till personer som har varit på event'
    aliases = []
    defer = true
    ephemeral = true
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    async execute(interaction: CommandInteraction) {
        const user_select = new UserSelectMenuBuilder()
            .setCustomId('users')
            .setPlaceholder('Välj användare')
            .setMinValues(1)
            .setMaxValues(25);
        const select_row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(user_select);
        const submit_button = new ButtonBuilder()
            .setCustomId('submit')
            .setLabel("Ge xp")
            .setStyle(ButtonStyle.Success);
        const button_row = new ActionRowBuilder<ButtonBuilder>().addComponents(submit_button);

        const message = await interaction.editReply({content: 'Välj användare som ska få xp', components: [select_row,button_row]})

        const collector = message.createMessageComponentCollector({time: 1000 * 60 * 10});

        const users = new Set<User>();
        collector.on('collect', async (messageComponentInteraction) => {
            if (messageComponentInteraction.customId === 'submit') {
                users.forEach(async (user) => {
                    const profile_data = await GamerBotAPIInstance.models.get_profile_data(user.id);
                    profile_data.xp += Math.floor(((profile_data.level ** 2) * 0.1));
                    await profile_data.save();
                })
                interaction.editReply({content: 'Xp har givits till användarna', components: []});
            }else if (messageComponentInteraction.customId === 'users') {
                const userSelectInteraction = (messageComponentInteraction as UserSelectMenuInteraction)
                const values = userSelectInteraction.users;
                values.forEach((value) => {
                    users.add(value);
                })
                userSelectInteraction.deferUpdate();
            }
        })
        collector.on('end', async () => {
           interaction.editReply({content: 'Tiden har gått ut', components: []}); 
        });
    }
}