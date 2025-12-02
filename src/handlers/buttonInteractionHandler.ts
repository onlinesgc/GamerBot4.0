import { Handler } from "../classes/handler.js";
import fs from "fs";
import { _dirname, GamerbotClient } from "../index.js";
import path from "path";

/**
 * Loops over all button files and imports them
 */
export default class CommandHandler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        const buttonFilesAndDirs = fs.readdirSync(
            path.join(_dirname, "/botInteractions/buttonInteractions"),
            { withFileTypes: true },
        );
        //Get all directories
        const buttonDirs = buttonFilesAndDirs.filter((file) =>
            file.isDirectory(),
        );
        //Get all files from top level
        const buttonFiles = buttonFilesAndDirs
            .filter(
                (file) =>
                    (file.name.endsWith(".ts") || file.name.endsWith(".js")) &&
                    !file.isDirectory(),
            )
            .map(
                (file) => "/botInteractions/buttonInteractions/" + file.name,
            );

        //Get all files from sub directories
        for (const dir of buttonDirs) {
            buttonFiles.push(
                ...fs
                    .readdirSync(
                        path.join(
                            _dirname,
                            "/botInteractions/buttonInteractions/" + dir.name,
                        ),
                    )
                    .filter(
                        (file) => file.endsWith(".ts") || file.endsWith(".js"),
                    )
                    .map(
                        (file) =>
                            "/botInteractions/buttonInteractions/" +
                            dir.name +
                            "/" +
                            file,
                    ),
            );
        }
        //Import all files
        buttonFiles.forEach((file) => {
            import(".." + file).then((_button) => {
                const button = new _button.default();
                client.buttons.set(button.name, button);
            });
        });
    }
}
