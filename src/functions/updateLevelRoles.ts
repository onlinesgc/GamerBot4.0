import { GuildMember } from "discord.js";
import { GamerBotAPIInstance } from "../index.js";
import { PorfileData } from "gamerbot-module";

export async function updateLevelRoles(member:GuildMember, profile_data:PorfileData){
    const bot_config = await GamerBotAPIInstance.models.get_config_data(process.env.CONFIG_ID as unknown as number);
    //eslint-disable-next-line
    const xp_config = bot_config.xp as any;

    if(xp_config.levels.length){
        console.log("User leveled up but there are no level-roles configured");
        return;
    }
    
    const roles = await findRoles(xp_config.levels, profile_data.level);

    for (const level of xp_config.levels) {
        if(member.roles.cache.has(level.id)){
            if(!roles.includes(level.id))
                await member.roles.remove(level.id);
        }
    }

    const blockRoleUpdateRoleId = "1082393287731708015"

    await Promise.all(member.roles.cache.map(async t =>{
        if(t.id==blockRoleUpdateRoleId) {
            await roles.splice(roles.indexOf("818809151257575464"),1);
        }
    }));
    
    await member.roles.add(roles);
}
//eslint-disable-next-line
function findRoles(levels:any, lvl:number) {

    if(!levels.length) {
        return [];
    }
    
    else if (levels[levels.length-1].level > lvl-1){
        levels.pop();
        return findRoles(levels, lvl);
    }

    else {
        return levels[levels.length-1].id;
    }
}