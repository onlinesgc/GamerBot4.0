import {
    ApplicationCommandType,
    AttachmentBuilder,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
} from "discord.js";
import { Command } from "../../classes/command.js";
import { GamerBotAPIInstance } from "../../index.js";
import { UserData } from "gamerbot-module";

/**
 * Lvl command that shows the level of the user in a frame
 */
export default class LvlCommand implements Command<ContextMenuCommandInteraction> {
    name = "lvl";
    ephemeral = true;
    defer = true;
    description = "Titta vilken nivå du är på discorden!";
    aliases = ["me"];
    data = new ContextMenuCommandBuilder()
        .setName(this.name)
        .setType(ApplicationCommandType.User);
    async execute(interaction: ContextMenuCommandInteraction, userData: UserData) {
        const user = interaction.guild?.members.cache.get(interaction.targetId)?.user;

        if (!user) {
            interaction.editReply("Något gick fel, försök igen senare!");
            return;
        }

        if (userData.userId != user.id)
            userData = await GamerBotAPIInstance.models.getUserData(user.id);
        const file = new AttachmentBuilder(await GamerBotAPIInstance.models.getUserFrame(user.id, user.username, user.avatarURL()));
        file.setDescription(
            `${interaction.member?.user.username} är i level ${userData.levelSystem.level} och har ${userData.levelSystem.xp} xp!`,
        );
        interaction.editReply({ files: [file] });
    }
}
