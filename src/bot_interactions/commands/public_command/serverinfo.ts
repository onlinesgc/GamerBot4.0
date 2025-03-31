import {
    CommandInteraction,
    EmbedBuilder,
    Guild,
    PresenceUpdateStatus,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { get_emojis } from "../../../functions/emoji_counter_builder.js";

/**
 * Serverinfo command that shows information about the server
 */
export default class ServerInfoCommand implements Command {
    name = "serverinfo";
    ephemeral = false;
    defer = true;
    description = "ℹ️";
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
                { name: "😀 🧮", value: `\`${get_emojis( guild.memberCount )}\`` },
                {
                    name: "Status",
                    value: `
                    🟢 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Online).size}\` 🟢!
                    🟡 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Idle).size}\` 🟡.
                    🔴 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.DoNotDisturb).size}\` 🔴.
                    ⚫ \`${guild.members.cache.filter((m) => m.presence == null || m.presence.status === PresenceUpdateStatus.Offline || m.presence.status == PresenceUpdateStatus.Invisible).size}\` ⚫.

                    🟣 \`${guild.members.cache.filter((m) => m.premiumSince).size}\`
                    
                    🕓 \`${guild.members.cache.filter((m) => m.presence && m.presence.status === PresenceUpdateStatus.Online && m.permissions.has("Administrator") && !m.user.bot).size}\` 🤖`,
                },
                {
                    name: "<:icon_Trusted:951861057410965584>",
                    value: `
                    **<:icon_Trusted:951861057410965584> :** ${server_data[0].online ? `\`${get_emojis(server_data[0].players.online)}\` / \`${get_emojis(server_data[0].players.max)}\`` : "🔴"}
                    **🔴 <:icon_Trusted:951861057410965584> :** ${server_data[1].online ? `\`${get_emojis(server_data[1].players.online)}\` / \`${get_emojis(server_data[1].players.max)}\`` : "🔴"}
                    **<:icon_Parkourservern:952188934316757042>:** ${server_data[2].online ? `\`${get_emojis(server_data[2].players.online)}\` / \`${get_emojis(server_data[2].players.max)}\`` : "🔴"}
                    `,
                },
                {
                    name: "<a:vibecat:813405042887491594>",
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
