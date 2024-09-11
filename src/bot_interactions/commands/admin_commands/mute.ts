import {
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { MogLog } from "../../../classes/modlog";
import { modLogToObject } from "../../../functions/moglog_functions";
import ms from "ms";

export default class MuteCommand implements Command {
    name = "mute";
    ephemeral = false;
    description = "Timar ut personen en viss tid.";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill muta")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till mutet")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Tid du mutar en person")
                .setRequired(true),
        );
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const time =
            (interaction.options.get("time", false)?.value as string) || "0";
        const has_sent_message = await MuteCommand.mute(member, reason, time, interaction.user.id,`Du har blivit mutead i SGC.\nAnledningen är **${reason}**`);

        const mute_embed = new EmbedBuilder()
            .setTitle("Mute")
            .setDescription(
                `${member.user.username} har blivit mutead i ${time} för **${reason}**` + (has_sent_message ? "" : "\n(Personen har stängt av DMs)")
            )
            .setFooter({
                text: this.name,
                iconURL: interaction.client.user
                    .avatarURL()
                    ?.toString(),
            })
            .setTimestamp()
            .setColor("Green");

        interaction.editReply({embeds: [mute_embed]});
    }
    public static async mute(member: GuildMember, reason: string, time: string, authorId: string, message: string) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        );

        const mod_log = new MogLog("mute", member.id,member.user.username,reason,time,Date.now(),authorId);
        profile_data.modLogs.push(modLogToObject(mod_log));
        profile_data.save();
        
        let has_sent_message = true;
        await member.send(message).catch(() => {has_sent_message = false});
        await member.timeout(ms(time),reason);
        return has_sent_message;
    }
}
