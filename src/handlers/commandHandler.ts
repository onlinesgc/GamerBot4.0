import { Handler } from "../classes/handler.js";
import fs from "fs";
import { _dirname, GamerbotClient } from "../index.js";
import path from "path";

/**
 * Loops over all command files and imports them
 */
export default class CommandHandler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        const commandFilesAndDirs = fs.readdirSync(
            path.join(_dirname, "/botInteractions/commands"),
            { withFileTypes: true },
        );
        //Get all directories
        const commandDirs = commandFilesAndDirs.filter((file) =>
            file.isDirectory(),
        );
        //Get all files from top level
        const commandFiles = commandFilesAndDirs
            .filter(
                (file) =>
                    (file.name.endsWith(".ts") || file.name.endsWith(".js")) &&
                    !file.isDirectory(),
            )
            .map((file) => "../botInteractions/commands/" + file.name);
        //Get all files from sub directories
        for (const dir of commandDirs) {
            commandFiles.push(
                ...fs
                    .readdirSync(
                        path.join(
                            _dirname,
                            "/botInteractions/commands/" + dir.name,
                        ),
                    )
                    .filter(
                        (file) => file.endsWith(".ts") || file.endsWith(".js"),
                    )
                    .map(
                        (file) =>
                            "../botInteractions/commands/" +
                            dir.name +
                            "/" +
                            file,
                    ),
            );
        }
        //Import all files
        commandFiles.forEach((file) => {
            import(file).then((_command) => {
                const command = new _command.default();
                client.commands.set(command.name, command);
                command.aliases.forEach((alias: object) => {
                    const aliasCommand = command.data.toJSON();
                    aliasCommand.name = alias;
                    client.commandArray.push(aliasCommand);
                });
                client.commandArray.push(command.data.toJSON());
            });
        });
    }
}
