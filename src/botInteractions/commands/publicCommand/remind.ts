import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";
import ms, { StringValue } from "ms";
import { UserData } from "gamerbot-module";
import { GamerbotClient } from "../../../index.js";

export default class RemindCommand implements Command<ChatInputCommandInteraction> {
    name = "remind";
    ephemeral = false;
    defer = true;
    description = "Rappelle-toi quelque chose !";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("reminder")
                .setDescription("Ce dont vous voulez vous souvenir")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription(
                    "Indiquez le temps que vous souhaitez que cela prenne, par exemple 7 jours, 5 mois et 10 heures.",
                )
                .setRequired(true),
        );
    async execute(
        interaction: ChatInputCommandInteraction,
        userData: UserData,
    ) {
        const reminder = interaction.options.get("reminder", true)
            .value as string;
        const time = interaction.options.get("time", true).value as string;

        const timeMs = ms(time as StringValue);
        if (!timeMs)
            return interaction.editReply(
                "Heure saisie incorrecte, veuillez réessayer !",
            );

        const remindTimestamp = Date.now() + timeMs;
        userData.reminders.push({
            message: reminder,
            timestamp: remindTimestamp,
            userId: interaction.user.id,
        });
        userData.save();
        (interaction.client as GamerbotClient).reminderList.push({
            message: reminder,
            timestamp: remindTimestamp,
            userId: interaction.user.id,
        });
        interaction.editReply(
            `Je vous le rappellerai. ${reminder} si ${time}!`,
        );
    }
}
