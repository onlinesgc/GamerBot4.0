import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
    name: string;
    ephemeral: boolean;
    description: string;
    aliases: string[];
    data: SlashCommandBuilder;
    /**
     * Run the command
     * @param interaction Discord interaction
     * @param profileData Data for the user that sent the command
     * @returns 
     */
    execute: (interaction: CommandInteraction, profileData:any) => void;
}