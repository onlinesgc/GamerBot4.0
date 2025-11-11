import {
    AttachmentBuilder,
    BufferResolvable,
    CommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { UserData } from "gamerbot-module";

/**
 * Lvl command that shows the level of the user in a frame
 */
export default class LvlCommand implements Command {
    name = "lvl";
    ephemeral = false;
    defer = true;
    description = "Titta vilken nivå du är på discorden!";
    aliases = ["me"];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Titta på en annan medlems lvl")
                .setRequired(false),
        );
    async execute(interaction: CommandInteraction, userData: UserData) {
        const user =
            interaction.options.get("user", false)?.user || interaction.user;
        if (userData.userId != user.id)
            userData = await GamerBotAPIInstance.models.getUserData(
                user.id as string,
            );
        const file = new AttachmentBuilder(
            (await GamerBotAPIInstance.models.getUserFrame(
                user.id as string,
                user.username as string,
                user.avatarURL({ extension: "png" }) as string,
                true,
            )) as BufferResolvable,
        );
        file.setDescription(
            `${interaction.member?.user.username} är i level ${userData.levelSystem.xp - 1} och har ${userData.levelSystem.xp} xp!`,
        );
        interaction.editReply({ files: [file] });
    }
}
