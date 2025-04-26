import { GuildMember } from "discord.js";
import { GamerBotAPIInstance } from "../index.js";
import { UserData, Level } from "gamerbot-module";

export async function updateLevelRoles(
    member: GuildMember,
    userData: UserData,
) {
    const botConfig = await GamerBotAPIInstance.models.getConfigData(
        process.env.CONFIG_ID as unknown as number,
    );

    const xpConfig = botConfig.levelSystem;

    if (!xpConfig.levels.length) {
        console.log("User leveled up but there are no level-roles configured");
        return;
    }

    const roles = await findRoles(xpConfig.levels, userData.levelSystem.level);

    for (const level of xpConfig.levels) {
        if ((level.ids as string[]).some((id: string) => roles.includes(id)))
            continue;
        await member.roles.remove(level.ids);
    }

    const blockRoleUpdateRoleId = "1082393287731708015";

    await Promise.all(
        member.roles.cache.map(async (t) => {
            if (t.id == blockRoleUpdateRoleId) {
                await roles.splice(roles.indexOf("818809151257575464"), 1);
            }
        }),
    );

    await member.roles.add(roles);
}

function findRoles(levels: Level[], lvl: number) {
    if (!levels.length) {
        return [];
    } else if (levels[levels.length - 1].level > lvl - 1) {
        levels.pop();
        return findRoles(levels, lvl);
    } else {
        return levels[levels.length - 1].ids;
    }
}
