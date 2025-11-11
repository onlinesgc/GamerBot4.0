import { GamerBotAPIInstance, GamerbotClient } from "../index.js";

/**
 * Get all frames available in the guild
 * @param {string} guildId
 * @returns {Promise<any[]>}
 */
export async function getAllFrames(guildId: string, client: GamerbotClient) {
    if (client.frameChoices.length > 0) return client.frameChoices;
    const frameConfig = (
        await GamerBotAPIInstance.models.getGuildData(guildId)
    ).frames;
    //eslint-disable-next-line
    const frameOptions: any[] = [];
    //eslint-disable-next-line
    frameConfig.forEach((frame: any) =>
        frameOptions.push({
            name:
                frame.id.toString() +
                ":" +
                (frame.name as string).toLowerCase(),
            value: frame.id.toString(),
        }),
    );
    client.frameChoices = frameOptions;
    return frameOptions;
}
