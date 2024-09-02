import { Client } from "discord.js";

export interface Handler {
    /**
     * Handler interface
     * @param client Discord client
     * @returns 
     */
    run: (client:Client) => void;
}