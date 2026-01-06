import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";

export default class LinkWhitelistCommand implements Command<ChatInputCommandInteraction> {
    name = "linkwhitelist";
    ephemeral = false;
    defer = true;
    description = "Lägg till en länk till whitelisten";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("link")
                .setDescription("Länken som ska läggas till")
                .setRequired(true),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    async execute(interaction: ChatInputCommandInteraction) {
        const link = interaction.options.get("link", true).value as string;
        const guildConfig = await GamerBotAPIInstance.models.getGuildData(
            interaction.guildId as string,
        );
        const newLink = { linkPrefix: link };
        guildConfig.autoModeration.whitelistedLinks.push(newLink.linkPrefix);
        guildConfig.save();
        interaction.editReply("Länken har lagts till i whitelisten!");
    }
}
