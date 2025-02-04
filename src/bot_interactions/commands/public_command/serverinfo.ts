import {
    CommandInteraction,
    EmbedBuilder,
    Guild,
    PresenceUpdateStatus,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";

/**
 * Serverinfo command that shows information about the server
 */
export default class ServerInfoCommand implements Command {
    name = "serverinfo";
    ephemeral = false;
    defer = true;
    description = "Visar information om servern";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: CommandInteraction) {
        const guild = interaction.guild as Guild;
        const server_data = await this.get_servers_data();
        const server_info_embed = new EmbedBuilder()
            .setColor("#2DD21C")
            .setTitle(`Serverinfo`)
            .setThumbnail(guild.iconURL() as string)
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user.avatarURL() as string,
            })
            .addFields(
                { name: "Medlemmar", value: `\`${guild.memberCount}\`` },
                {
                    name: "Status",
                    value: `
                    🟢 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Online).size}\` medlemmar är online!
                    🟡 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Idle).size}\` personer är idle.
                    🔴 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.DoNotDisturb).size}\` personer är stör ej.
                    ⚫ \`${guild.members.cache.filter((m) => m.presence == null || m.presence.status === PresenceUpdateStatus.Offline || m.presence.status == PresenceUpdateStatus.Invisible).size}\` personer är offline.

                    🟣 \`${guild.members.cache.filter((m) => m.premiumSince).size}\` Personer som bostar servern
                    
                    🕓 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Online && m.permissions.has("Administrator") && !m.user.bot).size}\` admins är tillgängliga!`,
                },
                {
                    name: "Minecraft servers",
                    value: `
                    **Trusted:** ${server_data[0].online ? `\`${server_data[0].players.online}\` / \`${server_data[0].players.max}\`` : "Servern är offline"}
                    **Creative:** ${server_data[1].online ? `\`${server_data[1].players.online}\` / \`${server_data[1].players.max}\`` : "Servern är offline"}
                    **Parkour servern:** ${server_data[2].online ? `\`${server_data[2].players.online}\` / \`${server_data[2].players.max}\`` : "Servern är offline"}
                    `,
                },
                {
                    name: "Boost nivå",
                    value: `\`${guild.premiumTier}\``,
                },
            );
        interaction.editReply({ embeds: [server_info_embed] });
    }
    async get_servers_data() {
        const server_data = [];
        server_data.push(
            await new Promise((resolve) => {
                fetch("https://api.mcsrvstat.us/3/trusted.sgc.se")
                    .then((data) => data.json())
                    .then((data) => resolve(data));
            }),
        );
        server_data.push(
            await new Promise((resolve) => {
                fetch("https://api.mcsrvstat.us/3/creative.sgc.se")
                    .then((data) => data.json())
                    .then((data) => resolve(data));
            }),
        );
        server_data.push(
            await new Promise((resolve) => {
                fetch("https://api.mcsrvstat.us/3/parkour.sgc.se")
                    .then((data) => data.json())
                    .then((data) => resolve(data));
            }),
        );
        // eslint-disable-next-line
        return server_data as any;
    }
}
