import { Client } from "discord.js";

export interface event{
    /**
     * run event
     * @param client 
     * @returns 
     */
    run_event: (client:Client) => void;
}