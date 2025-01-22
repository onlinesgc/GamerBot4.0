import { Handler } from '../classes/handler.js'
import fs from 'fs'
import { _dirname, GamerbotClient } from "../index.js"
import path from 'path'

/**
 * Loops over all button files and imports them
 */
export default class command_handler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        const button_files_and_dirs = fs.readdirSync(
            path.join(_dirname, '/bot_interactions/button_interactions'),
            { withFileTypes: true },
        )
        //Get all directories
        const button_dirs = button_files_and_dirs.filter((file) =>
            file.isDirectory(),
        )
        //Get all files from top level
        const button_files = button_files_and_dirs
            .filter((file) => (file.name.endsWith('.ts') || file.name.endsWith(".js")) && !file.isDirectory())
            .map((file) => '/bot_interactions/button_interactions/' + file.name)

        //Get all files from sub directories
        for (const dir of button_dirs) {
            button_files.push(
                ...fs
                    .readdirSync(path.join(_dirname, '/bot_interactions/button_interactions/' + dir.name))
                    .filter((file) => file.endsWith('.ts') || file.endsWith(".js"))
                    .map(
                        (file) =>
                            '/bot_interactions/button_interactions/' +
                            dir.name +
                            '/' +
                            file,
                    ),
            )
        }
        //Import all files
        button_files.forEach((file) => {
            import(".."+file).then((_button) => {
                const button = new _button.default()
                client.buttons.set(button.name, button)
            })
        })
    }
}
