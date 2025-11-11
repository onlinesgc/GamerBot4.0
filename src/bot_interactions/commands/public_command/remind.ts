import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";
import ms from "ms";
import { UserData } from "gamerbot-module";
import { GamerbotClient } from "../../../index.js";

export default class RemindCommand implements Command {
    name = "remind";
    ephemeral = false;
    defer = true;
    description = "Påminn dig själv om något!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("reminder")
                .setDescription("Det du vill bli påmind om")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Ge tiden som du vill ska ta, Som 7d, 5m, 10h")
                .setRequired(true),
        );
    async execute(interaction: CommandInteraction, userData: UserData) {
        const reminder = interaction.options.get("reminder", true)
            .value as string;
        const time = interaction.options.get("time", true).value as string;

        const timeMs = ms(time);
        if (!timeMs)
            return interaction.editReply("Felaktig tid angiven, försök igen!");

        const remindTimestamp = Date.now() + timeMs;
        userData.reminders.push({
            message: reminder,
            remindTimestamp: remindTimestamp,
        });
        userData.save();
        (interaction.client as GamerbotClient).reminderList.push({
            message: reminder,
            remindTimestamp: remindTimestamp,
            userId: interaction.user.id,
        });
        interaction.editReply(
            `Jag kommer påminna dig om ${reminder} om ${time}!`,
        );
    }
}
