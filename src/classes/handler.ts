import { GamerbotClient } from '../index.js'

export interface Handler {
    /**
     * Handler interface
     * @param client Discord client
     * @returns
     */
    run: (client: GamerbotClient) => void
}
