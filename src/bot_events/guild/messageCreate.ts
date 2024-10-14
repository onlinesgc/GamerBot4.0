import { Client, GuildMember, Message } from "discord.js";
import { Event } from "../../classes/event";
import { GamerBotAPIInstance } from "../..";
import { PorfileData } from "gamerbot-module";
import { updateLevelRoles } from "../../functions/updateLevelRoles";

export default class messageCreate implements Event{
    constructor() {}
    run_event (client: Client, message:Message) {
        if(!message.inGuild()) return;
        this.xpCalculation(message);
    }

    private async xpCalculation(message:Message){
        const guild_data = await GamerBotAPIInstance.models.get_guild_data(message.guild?.id as string);

        if(guild_data.noXpChannels.includes(message.channel.id)) return;

        // Check if the message is in a thead from general chat and random shit
        const GENERAL_CHAT = "516611606822649870";
        const RANDOM_SHIT = "879782686468767794";
        if(message.channel.isThread() && (message.thread?.parentId == GENERAL_CHAT || message.thread?.parentId == RANDOM_SHIT)) return;

        const profile_data = await GamerBotAPIInstance.models.get_profile_data(message.member?.id as string);

        //returns until time is calculated
        if(profile_data.xpTimeoutUntil > message.createdTimestamp) return;

        const time_out = 10 * 60 * 1000; // ten mins

        //adds timeout
        profile_data.xpTimeoutUntil = message.createdTimestamp + time_out;

        //Gives xp, if similar word only give 1 xp.
        if(profile_data.old_old_messages.length >= 3)
            profile_data.old_old_messages.shift();
        
        if(profile_data.old_old_messages.includes(message.content.toLowerCase())){
            profile_data.xp += 1;
        }else{
            profile_data.xp += 3;
        }

        profile_data.old_old_messages.push(message.content.toLowerCase());

        const lvl_cap = 31;

        //if level up. xp cap is at lvl 30!
        if((profile_data.level**2 < profile_data.xp && profile_data.level <= 31) || (lvl_cap**2 < profile_data.xp && profile_data.level > 31)){
            profile_data.xp = 0;
            profile_data.level += 1;
            this.sendLvlText(profile_data, message);
            updateLevelRoles(message.member as GuildMember, profile_data);
        }
    }
    private async sendLvlText(profile_data:PorfileData, message:Message){
        
        let level_text = `Du levlade upp till level \`${profile_data.level - 1}\` i Onlineföreningen SGCs discord. Grattis!`;

        const config_data = await GamerBotAPIInstance.models.get_config_data(parseInt(process.env.CONFIG_ID as string));

        //eslint-disable-next-line
        (config_data.xp as unknown as any).levels.forEach((level:any) => {
            if(profile_data.level - 1 == level.level && level.message != undefined){
                level_text += level.message;
            }
        })
        message.member?.send(level_text).catch();
    }
    
}