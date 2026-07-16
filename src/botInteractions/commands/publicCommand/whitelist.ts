import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../../index.js";
import { Player } from "mc-server-management";

const SVEROK_ROLE_ID = "1013577257870184559"

export default class WhitelistCommand implements Command<ChatInputCommandInteraction> {
    constructor() {}
    name = "whitelist";
    ephemeral = false;
    defer = true;
    description = "Bli whitelistad på parkour servern";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((opt) => opt.setName("name").setDescription("Ditt minecraft namn").setRequired(true))
    async execute(interaction: ChatInputCommandInteraction) {
        const name = interaction.options.getString("name", true);
        const minecraftServer = (interaction.client as GamerbotClient).minecraftConnection;
        const member = interaction.guild?.members.cache.get(interaction.user.id);

        if (!member) return;

        if (!minecraftServer) {
            await interaction.editReply("Ingen minecraft server är kopplad till botten.");
            return;
        }

        if (!member.roles.cache.has(SVEROK_ROLE_ID)) {
            await interaction.editReply("Du har inte verifierat ditt medlemskap i föreningen. För att få whitelist, bli medlem i SGC:s förening och verifiera ditt medlemskap i discord med kommandot /sverok .");
            return;
        }

        const profile = await GamerBotAPIInstance.models.getUserData(member.id);

        if (profile.minecraftData.username != null) {
            await interaction.editReply("Du har redan blivit whitelistad!");
            return;
        }
        profile.minecraftData.username = name;
        await profile.save();

        minecraftServer.allowlist().add(Player.withName(name))

        await interaction.editReply(`Du har nu blivit tillagd på Parkourservern. IP: parkour.sgc.se . Tänk på att servern endast finns till Java Edition i Minecraft.`);

    }
}
