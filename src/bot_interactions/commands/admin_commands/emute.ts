import { CommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command";
import MuteCommand from "./mute";

export default class EmuteCommand implements Command {
    name = "emute";
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
                .setRequired(true)
                .addChoices(
                    { name: "short", value: "1h" },
                    { name: "standard", value: "8h" },
                    { name: "long", value: "20h" },
                ),
        );
    async execute(interaction: CommandInteraction) {
        const member = interaction.options.get("user", true)
            .member as GuildMember;
        const reason = interaction.options.get("reason", true).value as string;
        const time =
            (interaction.options.get("time", true).value as string) || "0";
        const has_sent_message = await MuteCommand.mute(member, reason, time, interaction.user.id,`Du har blivit tystad i SGC.\n**Du är jättevälkommen tillbaka igen efter ${time}. Kom ihåg respektera alla på servern och lyssna på staffsens regelpåminnelser.**`);

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
        await interaction.reply({ embeds: [mute_embed] });
    }
}
