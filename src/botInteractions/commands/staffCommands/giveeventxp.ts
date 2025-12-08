import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { updateLevelRoles } from "../../../functions/updateLevelRoles.js";

export default class GiveEventXp implements Command {
    name = "giveeventxp";
    description = "Ge xp till till personer som har varit på event";
    aliases = [];
    defer = true;
    ephemeral = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    async execute(interaction: ChatInputCommandInteraction) {
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId("users")
            .setPlaceholder("Välj användare")
            .setMinValues(1)
            .setMaxValues(25);
        const selectRow =
            new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
                userSelect,
            );
        const submitButton = new ButtonBuilder()
            .setCustomId("submit")
            .setLabel("Ge xp")
            .setStyle(ButtonStyle.Success);
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            submitButton,
        );

        const message = await interaction.editReply({
            content: "Välj användare som ska få xp",
            components: [selectRow, buttonRow],
        });

        const collector = message.createMessageComponentCollector({
            time: 1000 * 60 * 10,
        });

        const users = new Set<GuildMember>();
        collector.on("collect", async (messageComponentInteraction) => {
            if (messageComponentInteraction.customId === "submit") {
                users.forEach(async (user) => {
                    const userData =
                        await GamerBotAPIInstance.models.getUserData(
                            user.id,
                        );
                    userData.levelSystem.xp += Math.floor(
                        userData.levelSystem.xp ** 2 * 0.1,
                    );
                    const lvlCap = 31;
                    if ((userData.levelSystem.level ** 2 < userData.levelSystem.xp && userData.levelSystem.level <= 31) || (lvlCap ** 2 < userData.levelSystem.xp && userData.levelSystem.level > 31)) {
                        userData.levelSystem.xp = 0;
                        userData.levelSystem.level += 1;
                        await updateLevelRoles(user, userData);
                    }
                    await userData.save();

                });
                interaction.editReply({
                    content: "Xp har givits till användarna",
                    components: [],
                });
            } else if (messageComponentInteraction.customId === "users") {
                const userSelectInteraction =
                    messageComponentInteraction as UserSelectMenuInteraction;
                const values = userSelectInteraction.users;
                values.forEach((value) => {
                    users.add(value as unknown as GuildMember);
                });
                userSelectInteraction.deferUpdate();
            }
        });
        collector.on("end", async () => {
            interaction.editReply({
                content: "Tiden har gått ut",
                components: [],
            });
        });
    }
}
