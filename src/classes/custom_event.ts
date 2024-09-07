import { Client } from "discord.js";
import { GamerbotClient } from "..";

export interface CustomEvent{
    /**
     * run custom event
     * @param client 
     * @returns 
     */
    run_event: (client:Client | any,...args:any) => void;

    /**
     * custom emitor
     * @param client 
     * @returns 
     */
    emitor : (client:Client | any,callback:any) => void;
}