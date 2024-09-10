import { AttachmentBuilder, BufferResolvable, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { PorfileData } from "gamerbot-module";

/**
 * Lvl command that shows the level of the user in a frame
 */
export default class LvlCommand implements Command {
    name = "lvl";
    ephemeral= false;
    description = "Titta vilken nivå du är på discorden!";
    aliases = ["me"];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption(option => option.setName("user").setDescription("Titta på en annan medlems lvl").setRequired(false));
    async execute (interaction: CommandInteraction, profileData: PorfileData){
        const user = interaction.options.get("user", false)?.user || interaction.user;
        if(profileData.userID != user.id)
            profileData = await GamerBotAPIInstance.models.get_profile_data(user.id as string);
        const file = new AttachmentBuilder(await GamerBotAPIInstance.models.get_user_frame(user.id as string ,interaction.member?.user.username as string,interaction.user.avatarURL({extension:"png"}) as string) as BufferResolvable );
        file.setDescription(`${interaction.member?.user.username} är i level ${profileData.level-1} och har ${profileData.xp} xp!`);
        interaction.editReply({files:[file]});
    }
    
}