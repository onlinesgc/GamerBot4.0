import path from "path";
import { _dirname, GamerbotClient } from "../index.js";
import { Handler } from "../classes/handler.js";
import fs from "fs";
/**
 * Loops over discord events and starts them in
 * respective event file
 *
 * @param client - Discord client
 **/
export default class EventHandler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        console.log("Loading events...");
        ["client", "guild"].forEach((dir) => this.loadDir(dir, client));
        ["customEvents"].forEach((dir) => this.loadCustomEvent(dir, client));
    }

    private loadDir(dir: string, client: GamerbotClient) {
        const eventFiles = fs
            .readdirSync(path.join(_dirname, "/botEvents/" + dir))
            .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
        for (const file of eventFiles) {
            console.log(`Loading ${dir}/${file}`);
            import(`../botEvents/${dir}/${file}`).then((_event) => {
                const event = new _event.default();
                client.on(file.split(".")[0], (...args) =>
                    event.runEvent(client, ...args),
                );
            });
        }
    }

    private loadCustomEvent(dir: string, client: GamerbotClient) {
        const customEventFiles = fs
            .readdirSync(path.join(_dirname, "/botEvents/" + dir))
            .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
        for (const file of customEventFiles) {
            console.log(`Loading ${dir}/${file}`);
            import(`../botEvents/${dir}/${file}`).then((_event) => {
                const event = new _event.default();
                event.emitor(client);
            });
        }
    }
}
