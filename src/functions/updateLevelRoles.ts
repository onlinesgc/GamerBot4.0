import { GuildMember } from "discord.js";
import { GamerBotAPIInstance } from "../index.js";
import { UserData, Level } from "gamerbot-module";

export async function updateLevelRoles(
    member: GuildMember,
    userData: UserData,
) {
    const botConfig = await GamerBotAPIInstance.models.getConfigData(
        parseInt(process.env.CONFIG_ID!),
    );

    const xpConfig = botConfig.levelSystem;

    if (!xpConfig.levels.length) {
        console.log("User leveled up but there are no level-roles configured");
        return;
    }
    const xpConfigLevels = JSON.parse(JSON.stringify(xpConfig.levels));
    const roles = findRoles(xpConfigLevels, userData.levelSystem.level);
    
    const rolesToRemove: string[] = [];
    for (const level of xpConfig.levels) {
        if (level.ids.every((id: string) => roles.includes(id))) continue;
        rolesToRemove.push(...level.ids);
    }
    console.log("Removing roles: ", rolesToRemove);
    await member.roles.remove(rolesToRemove);

    const blockRoleUpdateRoleId = "1082393287731708015";

    await Promise.all(
        member.roles.cache.map(async (t) => {
            if (t.id == blockRoleUpdateRoleId) {
                roles.splice(roles.indexOf("818809151257575464"), 1);
            }
        }),
    );
    console.log("Adding roles: ", roles);
    await member.roles.add(roles);
}

function findRoles(levels: Level[], lvl: number) {
    if (!levels.length) {
        return [];
    } else if (levels[levels.length - 1].level > lvl) {
        levels.pop();
        return findRoles(levels, lvl);
    } else {
        return levels[levels.length - 1].ids;
    }
}
