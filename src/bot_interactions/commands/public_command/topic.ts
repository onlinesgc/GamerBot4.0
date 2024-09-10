import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    GuildMember,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { getRndInteger } from "../../../functions/getRndInt";

export default class TopicCommand implements Command {
    name = "topic";
    ephemeral = false;
    description = "Få ett ämne man kan diskutera i chatten";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("topic")
                .setDescription("Lägg till en ny (Admin command)")
                .setRequired(false),
        );
    async execute(interaction: CommandInteraction) {
        const guild_config = await GamerBotAPIInstance.models.get_guild_data(
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
                    "Du måste vara admin för att kunna lägga till ett nytt ämne!",
                );
                return;
            }
            guild_config.topicList.push(topic as string);
            guild_config.save();
            interaction.editReply("Ämnet har lagts till!");
        } else {
            if (guild_config.topicList.length == 0)
                return interaction.editReply(
                    "Det finns inga topics i systemet! Lägg till några :)",
                );
            await interaction.editReply(
                guild_config.topicList[
                    await getRndInteger(0, guild_config.topicList.length)
                ],
            );
        }
    }
}
