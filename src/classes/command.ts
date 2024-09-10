import { CommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import { PorfileData } from "gamerbot-module";

export interface Command {
    name: string;
    ephemeral: boolean;
    description: string;
    aliases: string[];
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
    /**
     * Run the command
     * @param interaction Discord interaction
     * @param profileData Data for the user that sent the command
     * @returns 
     */
    execute: (interaction: CommandInteraction, profileData:PorfileData) => void;
}