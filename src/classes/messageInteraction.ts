import { Message } from "discord.js";

export interface MessageInteraction {
    name: string;
    execute: (interaction: Message) => void;
}
