import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { objectToModLog } from "../../../functions/moglogFunctions.js";

export default class ModLogCommand implements Command<ChatInputCommandInteraction> {
    name = "modlog";
    ephemeral = false;
    defer = true;
    description = "Visar loggar för en användare";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill se loggar för")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.get("user", true).user;
        if (!user) return interaction.editReply("Användaren finns inte");

        const modlogs = (
            await GamerBotAPIInstance.models.getUserData(user.id)
        ).modLogs;

        if (
            !modlogs &&
            !Array.isArray(modlogs) &&
            //eslint-disable-next-line
            (modlogs as Array<any>).length < 1
        )
            return interaction.editReply("Användaren har inga loggar");

        const modlogRows = new ActionRowBuilder<ButtonBuilder>().addComponents(
            [
                new ButtonBuilder()
                    .setCustomId("modlog_previous")
                    .setEmoji("⬅️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("modlog_next")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Secondary),
            ],
        );
        let startPointer = 0;
        const logCount = 5;

        let amountLogsShown = modlogs.length;

        if (amountLogsShown === 0)
            return interaction.editReply("Användaren har inga loggar");

        if (amountLogsShown <= logCount) {
            (modlogRows.components[1] as ButtonBuilder).setDisabled(true);
        } else {
            amountLogsShown = logCount;
        }

        const message = await interaction.editReply({
            embeds: [
                await this.getUserModLogs(
                    modlogs,
                    interaction,
                    startPointer,
                    logCount,
                ),
            ],
            components: [modlogRows],
        });

        const collector = message.createMessageComponentCollector({
            time: 1000 * 60 * 5,
        });
        collector.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "modlog_previous") {
                startPointer -= logCount;
                if (startPointer <= 0) {
                    startPointer = 0;
                    (modlogRows.components[0] as ButtonBuilder).setDisabled(
                        true,
                    );
                }
                (modlogRows.components[1] as ButtonBuilder).setDisabled(false);
            } else if (buttonInteraction.customId === "modlog_next") {
                startPointer += logCount;
                if (startPointer + logCount >= modlogs.length) {
                    startPointer = modlogs.length - logCount;
                    (modlogRows.components[1] as ButtonBuilder).setDisabled(
                        true,
                    );
                }
                (modlogRows.components[0] as ButtonBuilder).setDisabled(false);
            }
            await buttonInteraction.update({
                embeds: [
                    await this.getUserModLogs(
                        modlogs,
                        interaction,
                        startPointer,
                        logCount,
                    ),
                ],
                components: [modlogRows],
            });
        });
    }
    async getUserModLogs(
        //eslint-disable-next-line
        modLogs: any,
        interaction: CommandInteraction,
        start: number,
        logCount: number,
    ) {
        const fields = [];
        let logCounter = start;
        for (const log of modLogs.slice(start, start + logCount)) {
            const modLog = objectToModLog(log);
            fields.push(modLog.getEmbedField(logCounter));
            logCounter++;
        }
        return new EmbedBuilder()
            .setTitle("Mod logs")
            .setDescription("Här är användarens mod logs")
            .setColor("Green")
            .addFields(fields)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            })
            .setTimestamp();
    }
}
