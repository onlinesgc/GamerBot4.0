import {
    ChannelType,
    Client,
    GuildMember,
    PermissionFlagsBits,
    TextChannel,
    VoiceChannel,
    VoiceState,
} from 'discord.js'
import { CustomEvent } from '../../classes/custom_event.js'
import { GamerBotAPIInstance } from '../../index.js'

export default class VoiceEvents implements CustomEvent {
    async emitor(client: Client) {
        client.on('voiceStateUpdate', async (oldState, newState) => {
            if (oldState.channelId == newState.channelId) return
            if (oldState.channelId === null && newState.channelId !== null) {
                this.onJoin(oldState, newState)
            } else if (
                oldState.channelId !== null &&
                newState.channelId === null
            ) {
                this.onLeave(oldState)
            } else if (
                oldState.channelId !== null &&
                newState.channelId !== null
            ) {
                this.onSwitch(oldState, newState)
            }
        })
    }
    async onJoin(oldState: VoiceState, newState: VoiceState) {
        const guild_data = await GamerBotAPIInstance.models.get_guild_data(
            newState.guild.id,
        )
        this.removeCustomVoiceChannel(
            newState.channelId as string,
            newState.member as GuildMember,
        )

        if (
            newState.channelId != guild_data.privateVoiceChannel &&
            newState.channelId != guild_data.publicVoiceChannel
        )
            return
        this.createCustomVoiceChannel(newState)
    }
    onLeave(oldState: VoiceState) {
        this.removeCustomVoiceChannel(
            oldState.channelId as string,
            oldState.member as GuildMember,
        )
    }
    async onSwitch(oldState: VoiceState, newState: VoiceState) {
        const guild_data = await GamerBotAPIInstance.models.get_guild_data(
            newState.guild.id,
        )
        if (
            oldState.channelId == guild_data.privateVoiceChannel ||
            oldState.channelId == guild_data.publicVoiceChannel
        )
            return
        this.removeCustomVoiceChannel(
            oldState.channelId as string,
            oldState.member as GuildMember,
        )
    }

    async createCustomVoiceChannel(member: VoiceState) {
        const custom_voice_channel = await member.guild.channels.create({
            name: `${member.member?.user.username}'s röstkanal`,
            type: ChannelType.GuildVoice,
        })
        await custom_voice_channel.setParent(member.channel?.parentId as string)

        const guild_data = await GamerBotAPIInstance.models.get_guild_data(
            member.guild.id,
        )
        const info_channel = member.guild.channels.cache.get(
            guild_data.infoVoiceChannel,
        ) as TextChannel

        await custom_voice_channel.permissionOverwrites.set([
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
        ])
        const threed_channel = await info_channel.threads.create({
            name: `Threads - ${member.member?.user.username}'s röstkanal`,
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread,
            invitable: true,
        })
        threed_channel.members.add(member.id)
        threed_channel.send(
            `Made a new voice chat thread for you! <@!${member.id}>`,
        )
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        )
        profile_data.privateVoiceID = custom_voice_channel.id
        profile_data.privateVoiceThreadID = threed_channel.id
        await profile_data.save()
        await member.setChannel(custom_voice_channel)
    }

    async removeCustomVoiceChannel(channelId: string, member: GuildMember) {
        const guild_data = await GamerBotAPIInstance.models.get_guild_data(
            member.guild.id,
        )
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            member.id,
        )
        const voice_channel: VoiceChannel = member.guild.channels.cache.get(
            channelId,
        ) as VoiceChannel
        const threed_channel = (
            member.guild.channels.cache.get(
                guild_data.infoVoiceChannel,
            ) as TextChannel
        ).threads.cache.get(profile_data.privateVoiceThreadID)
        if (
            voice_channel.id != profile_data.privateVoiceID &&
            voice_channel.id != profile_data.privateVoiceThreadID
        )
            return
        if (voice_channel == undefined) return
        if (voice_channel.members.size <= 0) {
            await voice_channel.delete()
            await threed_channel?.delete()
            profile_data.privateVoiceID = ''
            profile_data.privateVoiceThreadID = ''
            await profile_data.save()
            return
        } else {
            const new_owner = voice_channel.members.first() as GuildMember
            const new_owner_profile =
                await GamerBotAPIInstance.models.get_profile_data(new_owner.id)
            new_owner_profile.privateVoiceID = voice_channel.id
            new_owner_profile.privateVoiceThreadID =
                profile_data.privateVoiceThreadID
            await new_owner_profile.save()
            profile_data.privateVoiceID = ''
            profile_data.privateVoiceThreadID = ''
            await profile_data.save()
            await threed_channel?.members.add(new_owner.id)
            await threed_channel?.send(
                `__**${member.user.username}**__ har lämnat röstkanalen. Röstkanalens nya ägare är nu __**${member.user.username}**__`,
            )
        }
    }
}
