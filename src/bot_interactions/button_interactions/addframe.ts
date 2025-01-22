import { ButtonInteraction } from "discord.js";
import { Button } from "../../classes/button.js";
import { GamerBotAPIInstance } from "../../index.js";

export default class AddFrame implements Button{
    name = "addframe";
    defer = true;
    async execute (interaction: ButtonInteraction, args: string[]){
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(interaction.user.id);
        const guild_data = await GamerBotAPIInstance.models.get_guild_data("516605157795037185");
        const has_frame = profile_data.exclusiveFrames.find((frame) => frame == args[0]);
        if(has_frame == undefined){
            profile_data.exclusiveFrames.push(args[0]);
            await profile_data.save();
            interaction.reply(`Du har nu lagt till ramen ${args[0]}!`);
            return
        }
        else {
            //eslint-disable-next-line
            interaction.reply(`Du har redan fått ${(guild_data.frameConfig[parseInt(args[0])] as any).name}!`);
            return
        }
    }
    
}