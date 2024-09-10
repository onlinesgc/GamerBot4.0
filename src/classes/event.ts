import { Client } from "discord.js";

export interface Event {
    /**
     * run event
     * @param client
     * @returns
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run_event: (client: Client, ...args: any) => void;
}
