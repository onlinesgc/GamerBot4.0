import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { UserData } from "gamerbot-module";

/**
 * Xptoplist command that shows the top list of xp
 */
export default class XptoplistCommand implements Command {
    name = "xptoplist";
    ephemeral = false;
    defer = true;
    description = "Vissar topplistan för xp";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction) {
        const maxUsers = 300;
        const usersPerPage = 10;
        let pointer = 0;
        const profiles =
            await GamerBotAPIInstance.models.getAllUserData(maxUsers);

        const xpToplistEmbed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle(":trophy:  Xp Topplista")
            .addFields(await this.generate_fields(profiles, pointer, 10))
            .setTimestamp()
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL()?.toString(),
            });

        const directionButtons =
            new ActionRowBuilder<ButtonBuilder>().addComponents([
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("⬅️")
                    .setCustomId("xptoplist_previous")
                    .setDisabled(true),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("➡️")
                    .setCustomId("xptoplist_next")
                    .setDisabled(false),
            ]);
        const xpToplistMessage = await interaction.editReply({
            embeds: [xpToplistEmbed],
            components: [directionButtons],
        });
        const collector = xpToplistMessage.createMessageComponentCollector({
            time: 1000 * 60 * 5,
        });

        collector.on("collect", async (buttonInteraction) => {
            switch (buttonInteraction.customId) {
                case "xptoplist_previous":
                    directionButtons.components[1].setDisabled(false);
                    if (pointer > 0) {
                        pointer -= usersPerPage;
                    }
                    if (pointer === 0) {
                        directionButtons.components[0].setDisabled(true);
                    }
                    break;
                case "xptoplist_next":
                    directionButtons.components[0].setDisabled(false);
                    pointer += usersPerPage;
                    if (pointer >= maxUsers) {
                        pointer -= usersPerPage;
                    } else if (pointer + usersPerPage >= maxUsers) {
                        directionButtons.components[1].setDisabled(true);
                    }
                    break;
            }
            xpToplistEmbed.setFields(
                await this.generate_fields(profiles, pointer, usersPerPage),
            );
            buttonInteraction.update({
                embeds: [xpToplistEmbed],
                components: [directionButtons],
            });
        });
        collector.on("end", async () => {
            directionButtons.components[0].setDisabled(true);
            directionButtons.components[1].setDisabled(true);
            xpToplistMessage.edit({
                embeds: [xpToplistEmbed],
                components: [directionButtons],
            });
        });
    }
    private async generate_fields(
        profiles: UserData[],
        starterPointer: number,
        userCount: number,
    ) {
        const fields = [];
        let i = 1;
        for (const profile of profiles.slice(
            starterPointer,
            starterPointer + userCount,
        )) {
            const level = profile.levelSystem.level;
            fields.push({
                name: (starterPointer + i).toString(),
                value: `
                Användare: <@!${profile.userId}>
                Level: \`${level}\`- (\`${Math.round((profile.levelSystem.xp / (level < 31 ? level ** 2 : 31 ** 2)) * 100)}%\`)`,
            });
            i++;
        }
        return fields;
    }
}
