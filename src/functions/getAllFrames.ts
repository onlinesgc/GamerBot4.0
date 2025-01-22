import { GamerBotAPIInstance, GamerbotClient } from '../index.js'

/**
 * Get all frames available in the guild
 * @param {string} guild_id
 * @returns {Promise<any[]>}
 */
export async function getAllFrames(guild_id: string, client: GamerbotClient) {
    if (client.frameChoices.length > 0) return client.frameChoices
    const frame_config = (
        await GamerBotAPIInstance.models.get_guild_data(guild_id)
    ).frameConfig
    //eslint-disable-next-line
    const frame_options: any[] = []
    //eslint-disable-next-line
    frame_config.forEach((frame: any) =>
        frame_options.push({
            name:
                frame.id.toString() +
                ':' +
                (frame.name as string).toLowerCase(),
            value: frame.id.toString(),
        }),
    )
    client.frameChoices = frame_options
    return frame_options
}
