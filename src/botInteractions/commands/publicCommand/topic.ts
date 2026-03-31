import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    GuildMember,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { getRndInteger } from "../../../functions/getRndInt.js";

export default class TopicCommand implements Command<ChatInputCommandInteraction> {
    name = "topic";
    ephemeral = false;
    defer = true;
    description = "Choisissez un sujet de discussion pour le chat.";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("topic")
                .setDescription("Ajouter un nouveau (Commande administrateur)")
                .setRequired(false),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const guild_config = await GamerBotAPIInstance.models.getGuildData(
            interaction.guildId as string,
        );
        const topic = interaction.options.get("topic", false)?.value;
        if (topic != undefined) {
            if (
                !(interaction.member as GuildMember).permissions.has(
                    PermissionFlagsBits.Administrator,
                )
            ) {
                interaction.reply(
                    "Vous devez être administrateur pour ajouter un nouveau sujet !",
                );
                return;
            }
            guild_config.topics.push(topic as string);
            guild_config.save();
            interaction.editReply("Le sujet a été ajouté !");
        } else {
            if (guild_config.topics.length == 0)
                return interaction.editReply(
                    "Aucun sujet n'est enregistré ! Ajoutez-en :)",
                );
            await interaction.editReply(
                guild_config.topics[
                    await getRndInteger(0, guild_config.topics.length)
                ],
            );
        }
    }
}
