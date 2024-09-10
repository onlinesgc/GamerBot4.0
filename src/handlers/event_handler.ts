import { GamerbotClient } from "..";
import { Handler } from "../classes/handler";
import fs from "fs";
/**
 * Loops over discord events and starts them in
 * respective event file
 *
 * @param client - Discord client
 **/
export default class event_handler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        console.log("Loading events...");
        ["client", "guild"].forEach((dir) => this.load_dir(dir, client));
        ["custom_events"].forEach((dir) => this.load_custom_event(dir, client));
    }

    private load_dir(dir: string, client: GamerbotClient) {
        const event_files = fs
            .readdirSync("./src/bot_events/" + dir)
            .filter((file) => file.endsWith(".ts"));
        for (const file of event_files) {
            console.log(`Loading ${dir}/${file}`);
            import(`../bot_events/${dir}/${file}`).then((_event) => {
                const event = new _event.default();
                client.on(file.split(".")[0], (...args) =>
                    event.run_event(client, ...args),
                );
            });
        }
    }

    private load_custom_event(dir: string, client: GamerbotClient) {
        const custom_event_files = fs
            .readdirSync("./src/bot_events/" + dir)
            .filter((file) => file.endsWith(".ts"));
        for (const file of custom_event_files) {
            console.log(`Loading ${dir}/${file}`);
            import(`../bot_events/${dir}/${file}`).then((_event) => {
                const event = new _event.default();
                event.emitor(client);
            });
        }
    }
}
