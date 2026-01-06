import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { UserData } from "gamerbot-module";

export interface Command<T extends ChatInputCommandInteraction | ContextMenuCommandInteraction = ChatInputCommandInteraction | ContextMenuCommandInteraction> {
    name: string;
    ephemeral: boolean;
    description: string;
    aliases: string[];
    defer: boolean;
    data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | ContextMenuCommandBuilder;
    /**
     * Run the command
     * @param interaction Discord interaction
     * @param profileData Data for the user that sent the command
     * @returns
     */
    execute: (
        interaction: T,
        profileData: UserData,
    ) => void;

    autoComplete?: (interaction: AutocompleteInteraction) => void;
}
