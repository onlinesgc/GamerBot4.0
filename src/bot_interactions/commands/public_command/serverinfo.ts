import { CommandInteraction, EmbedBuilder, Guild, PresenceUpdateStatus, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command";

/**
 * Serverinfo command that shows information about the server
 */
export default class ServerInfoCommand implements Command{
    name = "serverinfo"
    ephemeral = false;
    description = "Visar information om servern";
    aliases=[];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    execute(interaction: CommandInteraction){
        const guild = interaction.guild as Guild;
        const server_info_embed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle(`Serverinfo`)
            .setThumbnail(guild.iconURL() as string)
            .setFooter({text:this.name,iconURL:interaction.client.user.avatarURL() as string})
            .addFields(
                { name: "Medlemmar", value: `\`${guild.memberCount}\`` },
                { name: "Status", value: `
                    🟢 \`${guild.members.cache.filter(m => m.presence && m.presence.status === PresenceUpdateStatus.Online).size}\` medlemmar är online!
                    🟡 \`${guild.members.cache.filter(m => m.presence && m.presence.status === PresenceUpdateStatus.Idle).size}\` personer är idle.
                    🔴 \`${guild.members.cache.filter(m => m.presence && m.presence.status === PresenceUpdateStatus.DoNotDisturb).size}\` personer är stör ej.
                    ⚫ \`${guild.members.cache.filter(m => m.presence == null || m.presence.status === PresenceUpdateStatus.Offline || m.presence.status == PresenceUpdateStatus.Invisible).size}\` personer är offline.

                    🟣 \`${guild.members.cache.filter(m => m.premiumSince).size}\` Personer som bostar servern
                    
                    🕓 \`${guild.members.cache.filter(m => m.presence && m.presence.status === PresenceUpdateStatus.Online && m.permissions.has("Administrator") && !m.user.bot).size}\` admins är tillgängliga!`

                },
                {
                    name:"Boost nivå", value: `\`${guild.premiumTier}\``
                }
            );
        interaction.editReply({embeds:[server_info_embed]});
    }
    
}