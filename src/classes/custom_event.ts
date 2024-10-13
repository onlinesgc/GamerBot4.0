import { Client } from 'discord.js'

export interface CustomEvent {
    /**
     * custom emitor
     * @param client
     * @returns
     */
    emitor: (client: Client) => void
}
