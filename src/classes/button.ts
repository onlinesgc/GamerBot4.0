import { ButtonInteraction } from "discord.js";

export interface Button {
    name: string;
    defer:boolean;
    execute: (interaction: ButtonInteraction, args : string[]) => void;
}