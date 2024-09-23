import {
    SlashCommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { PorfileData } from "gamerbot-module/dist/classes/ProfileData";

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
    async execute(interaction: CommandInteraction) {
        const max_users = 300;
        const users_per_page = 10;
        let pointer = 0;
        const profiles =
            await GamerBotAPIInstance.models.get_all_profile_data(max_users);

        const xp_toplist_embed = new EmbedBuilder()
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
        const xp_toplist_message = await interaction.editReply({
            embeds: [xp_toplist_embed],
            components: [directionButtons],
        });
        const collector = xp_toplist_message.createMessageComponentCollector({
            time: 1000 * 60 * 5,
        });

        collector.on("collect", async (buttonInteraction) => {
            switch (buttonInteraction.customId) {
                case "xptoplist_previous":
                    directionButtons.components[1].setDisabled(false);
                    if (pointer > 0) {
                        pointer -= users_per_page;
                    }
                    if (pointer === 0) {
                        directionButtons.components[0].setDisabled(true);
                    }
                    break;
                case "xptoplist_next":
                    directionButtons.components[0].setDisabled(false);
                    pointer += users_per_page;
                    if (pointer >= max_users) {
                        pointer -= users_per_page;
                    } else if (pointer + users_per_page >= max_users) {
                        directionButtons.components[1].setDisabled(true);
                    }
                    break;
            }
            xp_toplist_embed.setFields(
                await this.generate_fields(profiles, pointer, users_per_page),
            );
            buttonInteraction.update({
                embeds: [xp_toplist_embed],
                components: [directionButtons],
            });
        });
        collector.on("end", async () => {
            directionButtons.components[0].setDisabled(true);
            directionButtons.components[1].setDisabled(true);
            xp_toplist_message.edit({
                embeds: [xp_toplist_embed],
                components: [directionButtons],
            });
        });
    }
    private async generate_fields(
        profiles: PorfileData[],
        starterPointer: number,
        userCount: number,
    ) {
        const fields = [];
        let i = 1;
        for (const profile of profiles.slice(
            starterPointer,
            starterPointer + userCount,
        )) {
            fields.push({
                name: (starterPointer + i).toString(),
                value: `
                Användare: <@!${profile.userID}>
                Level: \`${profile.level - 1}\`- (\`${Math.round((profile.xp / (profile.level < 31 ? profile.level ** 2 : 31 ** 2)) * 100)}%\`)`,
            });
            i++;
        }
        return fields;
    }
}
