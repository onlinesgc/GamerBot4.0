import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    GuildMember,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { getRndInteger } from "../../../functions/getRndInt.js";
import fs from "fs";

const emojis = fs.readFileSync("./emojis.json");
const emojis_json_global = JSON.parse(emojis.toString());

export default class TopicCommand implements Command {
    name = "topic";
    ephemeral = false;
    defer = true;
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
            const emoji_amount = getRndInteger(1, 15);
            let emoji_message = "";
            const emojis_json = JSON.parse(JSON.stringify(emojis_json_global));
            interaction.guild?.emojis.cache.forEach(emote => {
                emojis_json.push({
                    character: emote.toString(),
                });
            });
            for (let i = 0; i < emoji_amount; i++) {
                const emoji = emojis_json[getRndInteger(0, emojis_json.length - 1)];
                emoji_message += `${emoji.character}`;
            }
            await interaction.editReply(emoji_message);
        }
    }
}
