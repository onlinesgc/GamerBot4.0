import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";
import ms from "ms";
import { PorfileData } from "gamerbot-module";
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
    async execute(interaction: CommandInteraction, profileData: PorfileData) {
        const reminder = interaction.options.get("reminder", true)
            .value as string;
        const time = interaction.options.get("time", true).value as string;

        const time_ms = ms(time);
        if (time_ms == undefined)
            return interaction.editReply("Felaktig tid angiven, försök igen!");

        const remindTimestamp = Date.now() + time_ms;
        profileData.reminders.push({
            message: reminder,
            remindTimestamp: remindTimestamp,
        });
        profileData.save();
        (interaction.client as GamerbotClient).reminder_list.push({
            message: reminder,
            remindTimestamp: remindTimestamp,
            user_id: interaction.user.id,
        });
        interaction.editReply(
            `Jag kommer påminna dig om ${reminder} om ${time}!`,
        );
    }
}
