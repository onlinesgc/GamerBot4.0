import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command";
import ms from "ms";
import { PorfileData } from "gamerbot-module";
import { GamerbotClient } from "../../..";

export default class RemindCommand implements Command{
    name = "remind";
    ephemeral = false;
    description= "Påminn dig själv om något!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption(option => option.setName("reminder").setDescription("Det du vill bli påmind om").setRequired(true))
        .addStringOption(option => option.setName("time").setDescription("Ge tiden som du vill ska ta, Som 7d, 5m, 10h").setRequired(true));
    async execute(interaction: CommandInteraction, profileData: PorfileData){
        let reminder = interaction.options.get("reminder", true).value as string;
        let time = interaction.options.get("time", true).value as string;

        let time_ms = ms(time);
        if(time_ms == undefined) return interaction.editReply("Felaktig tid angiven, försök igen!");

        let remindTimestamp = Date.now() + time_ms;
        profileData.reminders.push({message:reminder,remindTimestamp:remindTimestamp});
        profileData.save();
        (interaction.client as GamerbotClient).reminder_list.push({message:reminder,remindTimestamp:remindTimestamp, user_id:interaction.user.id});
        interaction.editReply(`Jag kommer påminna dig om ${reminder} om ${time}!`);
    }
    
}