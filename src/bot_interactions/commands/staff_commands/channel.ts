import {
    SlashCommandBuilder,
    CommandInteraction,
    PermissionFlagsBits,
    EmbedBuilder,
    GuildChannel,
    Guild,
} from "discord.js";
import { Command } from "../../../classes/command.js";

export default class ChannelCommand implements Command {
    name = "channel";
    ephemeral = false;
    defer = true;
    description = "Channel kommand är för att ändra på kanaler i en server!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName("channel")
                .setDescription("Kanalen du vill ändra på")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("Typ av ändring")
                .setRequired(true)
                .addChoices(
                    { name: "relocate", value: "relocate" },
                    { name: "hide", value: "hide" },
                    { name: "show", value: "show" },
                    { name: "lock", value: "lock" },
                    { name: "unlock", value: "unlock" },
                ),
        )
        .addStringOption((option) =>
            option
                .setName("parent")
                .setDescription(
                    "[använd bara med relocate] Den kategorin du vill flytta till",
                )
                .setRequired(false),
        );
    async execute(interaction: CommandInteraction) {
        const channel = interaction.options.get("channel", true)
            .channel as GuildChannel;
        const type = interaction.options.get("type", true).value as string;
        const parent = interaction.options.get("parent", false)
            ?.value as string;

        const guild = interaction.guild as Guild;

        const channelEmbed = new EmbedBuilder().setTimestamp().setFooter({
            text: this.name,
            iconURL: interaction.client.user.avatarURL()?.toString(),
        });

        switch (type) {
            case "relocate": {
                if (!parent) {
                    channelEmbed.setTitle(
                        "Du måste ange en kategori att flytta till!",
                    );
                    await interaction.editReply({ embeds: [channelEmbed] });
                    return;
                }
                channel.setParent(parent);
                channelEmbed.setTitle(`Kanalen har flyttats till ${parent}`);
                break;
            }
            case "hide": {
                channel.permissionOverwrites.edit(guild.roles.everyone.id, {
                    ViewChannel: false,
                });
                channelEmbed.setTitle("Kanalen har gömts!");
                break;
            }
            case "show": {
                channel.permissionOverwrites.edit(guild.roles.everyone.id, {
                    ViewChannel: true,
                });
                channelEmbed.setTitle("Kanalen har visats!");
                break;
            }
            case "lock": {
                channel.permissionOverwrites.edit(guild.roles.everyone.id, {
                    SendMessages: false,
                });
                channelEmbed.setTitle("Kanalen har låsts!");
                break;
            }
            case "unlock": {
                channel.permissionOverwrites.edit(guild.roles.everyone.id, {
                    SendMessages: true,
                });
                channelEmbed.setTitle("Kanalen har låsts upp!");
                break;
            }
            default: {
                channelEmbed.setTitle("Något gick fel!");
                break;
            }
        }
        await interaction.editReply({ embeds: [channelEmbed] });
    }
}
