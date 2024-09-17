import {
    CommandInteraction,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { ModLog } from "../../../classes/modlog";
import { modLogToObject } from "../../../functions/moglog_functions";
import ms from "ms";
import { CreateModLogEmbed } from "../../../functions/createEmbed";

export default class BanCommand implements Command {
    name = "ban";
    ephemeral = false;
    description = "Banna en person från sereven!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill banna")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till bannet")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Tid du banar en person")
                .setRequired(false),
        )
        .addIntegerOption((option) =>
            option
                .setName("messages")
                .setDescription("Antal dagar av medelanden")
                .setRequired(false),
        );
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value;
        const time =
            (interaction.options.get("time", false)?.value as string) || "0";
        const messages =
            (interaction.options.get("messages", false)?.value as number) || 0;

        const has_sent_message = await this.banUser(
            member,
            reason as string,
            time,
            interaction.user.id,
            messages,
        );
        const ban_embed = CreateModLogEmbed(
            "ban",
            `${member.user.username} har blivit bannad för **${reason}**` +
                (has_sent_message ? "" : "\n(Personen har stängt av DMs)"),
            this.name,
            interaction,
        );

        interaction.editReply({
            embeds: [ban_embed],
        });
    }

    async banUser(
        member: GuildMember,
        reason: string,
        time: string,
        authorId: string,
        messages: number,
    ) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        );
        const modLog = new ModLog(
            "ban",
            member.id,
            member.user.username,
            reason,
            time,
            Date.now(),
            authorId,
        );
        profile_data.modLogs.push(modLogToObject(modLog));
        await profile_data.save();
        let hasSentMessage = true;
        await member
            .send(
                time == "0"
                    ? `Du har blivit bannad från SGC.\nAnledningen är **${reason}**`
                    : `Du har blivit bannad från SGC i ${time}.\nAnledningen är **${reason}**`,
            )
            .catch(() => {
                hasSentMessage = false;
            });
        if (time != "0") {
            const guild_config =
                await GamerBotAPIInstance.models.get_guild_data("guild_id");
            guild_config.bansTimes.push({
                userID: member.id,
                unbantime: Number(Date.now() + ms(time)),
            });
            guild_config.save();
        }
        await member.guild.bans.create(member.id, {
            reason: reason,
            deleteMessageSeconds: messages,
        });
        return hasSentMessage;
    }
}
