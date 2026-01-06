import { readdirSync } from "fs";
import { Handler } from "../classes/handler";
import { _dirname, GamerbotClient } from "../index.js";
import path from "path";

export default class ContextCommandHandler implements Handler {
    run (client: GamerbotClient) {
        const commandPath = path.join(_dirname, "/botInteractions/contextMenuCommands");
        const contextCommandFiles = readdirSync(commandPath, { withFileTypes: true })
            .filter(file => file.name.endsWith(".ts") || file.name.endsWith(".js"));
        for (const file of contextCommandFiles) {
            import(path.join(commandPath, file.name)).then((_command) => {
                const command = new _command.default();
                client.contextCommands.set(command.name, command);
                client.commandArray.push(command.data.toJSON());
            });
        }
    }
}