import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";

/**
 * Ping command that replies with pong! and the time it took to respond.
 */
export default class FrenchNameCommand implements Command<ChatInputCommandInteraction> {
    constructor() {}
    name = "frenchname";
    ephemeral = false;
    defer = true;
    description = "Francetonisez votre nom";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction) {
        interaction.editReply({
            content: frenchifyName(interaction.user.username),
        });
    }
}
function frenchifyName(name: string): string {
    let frenchified = name.trim();
    frenchified = frenchified.replace(/th/g, "z").replace(/Th/g, "Z");

    if (frenchified.toLowerCase().startsWith("h")) {
        frenchified = "'" + frenchified.slice(1);
    }

    const lastChar = frenchified.slice(-1).toLowerCase();

    if (lastChar === "o") {
        frenchified = frenchified.slice(0, -1) + "eau";
    } else if (lastChar === "y" || lastChar === "i") {
        frenchified = frenchified.slice(0, -1) + "ois";
    } else if (lastChar === "a") {
        frenchified = frenchified.slice(0, -1) + "ique";
    } else {
        frenchified = frenchified + "ette";
    }

    const startsWithVowelOrApostrophe = /^['aeiouy]/i.test(frenchified);

    let prefix = "";
    if (startsWithVowelOrApostrophe) {
        prefix = Math.random() > 0.5 ? "L'" : "Jean-";
    } else {
        prefix = Math.random() > 0.5 ? "Le " : "Jean-";
    }

    if (prefix === "L'") {
        frenchified =
            frenchified.charAt(1).toUpperCase() + frenchified.slice(2);
    } else if (frenchified.startsWith("'")) {
        frenchified =
            "'" + frenchified.charAt(1).toLowerCase() + frenchified.slice(2);
    }

    return `${prefix}${frenchified}`;
}
