import { Client } from "discord.js";

export interface handler {
    /**
     * Handler interface
     * @param client Discord client
     * @returns 
     */
    run: (client:Client) => void;
}