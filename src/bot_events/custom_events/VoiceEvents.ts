import {
    ChannelType,
    Client,
    GuildMember,
    PermissionFlagsBits,
    TextChannel,
    VoiceChannel,
    VoiceState,
} from "discord.js";
import { CustomEvent } from "../../classes/customEvent.js";
import { GamerBotAPIInstance } from "../../index.js";

export default class VoiceEvents implements CustomEvent {
    async emitor(client: Client) {
        client.on("voiceStateUpdate", async (oldState, newState) => {
            if (oldState.channelId == newState.channelId) return;
            if (oldState.channelId === null && newState.channelId !== null) {
                this.onJoin(oldState, newState);
            } else if (
                oldState.channelId !== null &&
                newState.channelId === null
            ) {
                this.onLeave(oldState);
            } else if (
                oldState.channelId !== null &&
                newState.channelId !== null
            ) {
                this.onSwitch(oldState, newState);
            }
        });
    }
    async onJoin(oldState: VoiceState, newState: VoiceState) {
        const guildData = await GamerBotAPIInstance.models.getGuildData(
            newState.guild.id,
        );
        this.removeCustomVoiceChannel(
            newState.channelId as string,
            newState.member as GuildMember,
        );

        if (
            newState.channelId != guildData.voiceChannelData.voiceChannelId
        )
            return;
        this.createCustomVoiceChannel(newState);
    }
    onLeave(oldState: VoiceState) {
        this.removeCustomVoiceChannel(
            oldState.channelId as string,
            oldState.member as GuildMember,
        );
    }
    async onSwitch(oldState: VoiceState, newState: VoiceState) {
        const guildData = await GamerBotAPIInstance.models.getGuildData(
            newState.guild.id,
        );
        if (
            oldState.channelId == guildData.voiceChannelData.voiceChannelId
        )
            return;
        this.removeCustomVoiceChannel(
            oldState.channelId as string,
            oldState.member as GuildMember,
        );
    }

    async createCustomVoiceChannel(member: VoiceState) {
        const customVoiceChannel = await member.guild.channels.create({
            name: `${member.member?.user.username}'s röstkanal`,
            type: ChannelType.GuildVoice,
        });
        await customVoiceChannel.setParent(
            member.channel?.parentId as string,
        );

        const guildData = await GamerBotAPIInstance.models.getGuildData(
            member.guild.id,
        );
        const infoChannel = member.guild.channels.cache.get(
            guildData.voiceChannelData.infoChatId,
        ) as TextChannel;

        await customVoiceChannel.permissionOverwrites.set([
            {
                id: member.member?.guild.roles.everyone.id as string,
                deny: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                ],
            },
            {
                id: member.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.Connect,
                    PermissionFlagsBits.Speak,
                ],
            },
        ]);
        const threedChannel = await infoChannel.threads.create({
            name: `Threads - ${member.member?.user.username}'s röstkanal`,
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread,
            invitable: true,
        });
        threedChannel.members.add(member.id);
        threedChannel.send(
            `Made a new voice chat thread for you! <@!${member.id}>`,
        );
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.id,
        );
        userData.voiceData.voiceChannelId = customVoiceChannel.id;
        userData.voiceData.voiceChannelThreadId = threedChannel.id;
        await userData.save();
        await member.setChannel(customVoiceChannel);
    }

    async removeCustomVoiceChannel(channelId: string, member: GuildMember) {
        const guildData = await GamerBotAPIInstance.models.getGuildData(
            member.guild.id,
        );
        const userData = await GamerBotAPIInstance.models.getUserData(
            member.id,
        );
        const voiceChannel: VoiceChannel = member.guild.channels.cache.get(
            channelId,
        ) as VoiceChannel;

        if (voiceChannel == undefined) return;

        const threedChannel = (
            member.guild.channels.cache.get(
                guildData.voiceChannelData.infoChatId,
            ) as TextChannel
        ).threads.cache.get(userData.voiceData.voiceChannelThreadId);
        if (
            voiceChannel.id != userData.voiceData.voiceChannelId
        )
            return;
        if (voiceChannel == undefined) return;
        if (voiceChannel.members.size <= 0) {
            await voiceChannel.delete();
            await threedChannel?.delete();
            userData.voiceData.voiceChannelId = "";
            userData.voiceData.voiceChannelThreadId = "";
            await userData.save();
            return;
        } else {
            const newOwner = voiceChannel.members.first() as GuildMember;
            const newOwnerData =
                await GamerBotAPIInstance.models.getUserData(newOwner.id);
            newOwnerData.voiceData.voiceChannelId = voiceChannel.id;
            newOwnerData.voiceData.voiceChannelThreadId =
                userData.voiceData.voiceChannelThreadId;
            await newOwnerData.save();
            userData.voiceData.voiceChannelId = "";
            userData.voiceData.voiceChannelThreadId = "";
            await userData.save();
            await threedChannel?.members.add(newOwner.id);
            await threedChannel?.send(
                `__**${member.user.username}**__ har lämnat röstkanalen. Röstkanalens nya ägare är nu __**${member.user.username}**__`,
            );
        }
    }
}
