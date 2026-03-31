import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder,
    TextChannel,
    VoiceChannel,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { UserData } from "gamerbot-module";
import { GamerBotAPIInstance } from "../../../index.js";

export default class VoiceCommand implements Command<ChatInputCommandInteraction> {
    name = "voice";
    ephemeral = false;
    defer = true;
    description = "Ändra på din voice kanal!";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
            option
                .setName("invite")
                .setDescription(
                    "La personne que vous souhaitez inviter à l'appel",
                )
                .setRequired(false),
        )
        .addUserOption((option) =>
            option
                .setName("kick")
                .setDescription(
                    "La personne que vous voulez exclure de la conversation",
                )
                .setRequired(false),
        )
        .addUserOption((option) =>
            option
                .setName("give")
                .setDescription(
                    "Attribuez la responsabilité à une autre personne de la conversation",
                )
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("Le nom de votre canal vocal")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("lock")
                .setDescription("Verrouiller la chaîne")
                .setRequired(false)
                .addChoices({ name: "Lock channel", value: "lock" }),
        )
        .addStringOption((option) =>
            option
                .setName("unlock")
                .setDescription("Débloquez la chaîne")
                .setRequired(false)
                .addChoices({ name: "Unlock channel", value: "unlock" }),
        )
        .addStringOption((option) =>
            option
                .setName("inviterole")
                .setDescription("Invitez tout un casting")
                .setRequired(false)
                .addChoices(
                    { name: "Alla trusted", value: "AllTrusted" },
                    { name: "VIP", value: "vip" },
                    { name: "XPTrusted", value: "818809151257575464" },
                    { name: "Twitch Mods", value: "924078241344536607" },
                    { name: "Eventsnubbar", value: "813804280741101678" },
                    { name: "Twitch Subs", value: "817886647915642930" },
                    { name: "YouTube Members", value: "835156231861698562" },
                    { name: "level 30", value: "872096892845166613" },
                ),
        )
        .addIntegerOption((option) =>
            option
                .setName("limit")
                .setDescription("Nombre maximal de personnes sur la chaîne")
                .setRequired(false),
        );
    async execute(
        interaction: ChatInputCommandInteraction,
        userData: UserData,
    ) {
        const guildMember = interaction.member as GuildMember;

        if (userData.voiceData.voiceChannelId !== guildMember.voice.channelId) {
            interaction.editReply(
                "Vous devez vous trouver sur votre canal privé pour utiliser cette commande.",
            );
            return;
        }

        const voiceChannel = guildMember.voice.channel as VoiceChannel;

        if (interaction.options.data.length == 0) {
            const voiceMembersEmbed = new EmbedBuilder()
                .setColor("#2DD21C")
                .setTitle(`${guildMember.displayName}'s canal vocal`)
                .addFields({
                    name: "invité",
                    value: await this.getVoiceMembers(voiceChannel),
                })
                .setTimestamp()
                .setFooter({
                    text: this.name,
                    iconURL: interaction.client.user.avatarURL()?.toString(),
                });
            return interaction.editReply({ embeds: [voiceMembersEmbed] });
        }

        let member;

        const guildData = await GamerBotAPIInstance.models.getGuildData(
            interaction.guildId as string,
        );
        const infoVoiceChannel = interaction.guild?.channels.cache.get(
            guildData.voiceChannelData.infoChatId,
        ) as TextChannel;

        switch (interaction.options.data[0].name) {
            case "invite": {
                member = interaction.options.get("invite", true)
                    .member as GuildMember;

                await infoVoiceChannel.threads.cache
                    .get(userData.voiceData.voiceChannelThreadId)
                    ?.members.add(member.id);
                await voiceChannel.permissionOverwrites.edit(member.id, {
                    ViewChannel: true,
                    Speak: true,
                    Connect: true,
                });
                interaction.editReply(
                    `Vous avez invité ${member.displayName} à votre chaîne !`,
                );
                break;
            }
            case "kick": {
                member = interaction.options.get("kick", true)
                    .member as GuildMember;
                await infoVoiceChannel.threads.cache
                    .get(userData.voiceData.voiceChannelThreadId)
                    ?.members.remove(member.id);
                await voiceChannel.permissionOverwrites.delete(member.id);
                await member.voice.disconnect();
                interaction.editReply(
                    `Tu as donné un coup de pied ${member.displayName} de ta chaîne !`,
                );
                break;
            }
            case "give": {
                member = interaction.options.get("give", true)
                    .member as GuildMember;
                if (!voiceChannel.members.has(member.id))
                    return interaction.editReply(
                        "La personne à qui vous souhaitez céder la propriété n'est pas sur la chaîne.",
                    );
                userData.voiceData.voiceChannelId = "";
                await userData.save();
                const giveMember = await GamerBotAPIInstance.models.getUserData(
                    member.id,
                );
                giveMember.voiceData.voiceChannelId = voiceChannel.id;
                giveMember.voiceData.voiceChannelThreadId =
                    userData.voiceData.voiceChannelThreadId;
                await giveMember.save();
                userData.voiceData.voiceChannelThreadId = "";
                await userData.save();
                await infoVoiceChannel.threads.cache
                    .get(userData.voiceData.voiceChannelThreadId)
                    ?.members.add(member.id);
                interaction.editReply(
                    `Vous avez cédé la propriété à ${member.displayName}`,
                );
                break;
            }
            case "name": {
                const name = interaction.options.get("name", true)
                    .value as string;
                voiceChannel.setName(name);
                interaction.editReply(`Vous avez renommé la chaîne en ${name}`);
                break;
            }
            case "lock": {
                voiceChannel.permissionOverwrites.edit(
                    interaction.guild?.roles.everyone.id as string,
                    { ViewChannel: false, Speak: false, Connect: false },
                );
                interaction.editReply("La chaîne est désormais verrouillée !");
                break;
            }
            case "unlock": {
                voiceChannel.permissionOverwrites.edit(
                    interaction.guild?.roles.everyone.id as string,
                    { ViewChannel: true, Speak: true, Connect: true },
                );
                interaction.editReply(
                    "La chaîne est désormais déverrouillée !",
                );
                break;
            }
            case "limit": {
                const limit = interaction.options.get("limit", true)
                    .value as number;
                voiceChannel.setUserLimit(limit);
                interaction.editReply(
                    `Vous avez fixé une limite sur ${limit} des gens sur la chaîne !`,
                );
                break;
            }
            case "inviterole": {
                const MultipleRoles = [
                    {
                        value: "AllTrusted",
                        roles: [
                            "813804280741101678",
                            "924078241344536607",
                            "520331216415621143",
                            "818809151257575464",
                            "821059798270214176",
                            "812324460429836318",
                            "813482380887064597",
                            "872157696709783552",
                        ],
                    },
                    {
                        value: "vip",
                        roles: [
                            "813804280741101678",
                            "924078241344536607",
                            "520331216415621143",
                            "818809151257575464",
                            "821059798270214176",
                            "812324460429836318",
                            "813482380887064597",
                            "817886647915642930",
                            "835156231861698562",
                        ],
                    },
                ];
                const value = interaction.options.get("inviterole", true)
                    .value as string;
                if (/\d/.test(value)) {
                    const role = value;
                    voiceChannel.permissionOverwrites.edit(role, {
                        ViewChannel: true,
                        Speak: true,
                        Connect: true,
                    });
                    interaction.editReply(
                        `Vous avez invité toutes les personnes ayant ce rôle ${interaction.guild?.roles.cache.get(role)?.name} à la chaîne !`,
                    );
                } else {
                    const role = MultipleRoles.find(
                        (role) => role.value == value,
                    );
                    role?.roles.forEach((role) => {
                        voiceChannel.permissionOverwrites.edit(role, {
                            ViewChannel: true,
                            Speak: true,
                            Connect: true,
                        });
                    });
                    interaction.editReply(
                        `Vous avez invité toutes les personnes ayant ce rôle ${value} à la chaîne !`,
                    );
                }
                break;
            }
        }
    }
    async getVoiceMembers(voiceChannel: VoiceChannel) {
        const members: string[] = [];
        voiceChannel.permissionOverwrites.cache.forEach((overwrite) => {
            if (overwrite.type !== 1) return;
            if (overwrite.allow.has(PermissionFlagsBits.ViewChannel)) {
                members.push(overwrite.id);
            }
        });
        const message = members.map((member) => `<@!${member}>`).join("\n");
        return message;
    }
}
