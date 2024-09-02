import { Client } from "discord.js";

export interface Event{
    /**
     * run event
     * @param client 
     * @returns 
     */
    run_event: (client:Client, ...args:any) => void;
}