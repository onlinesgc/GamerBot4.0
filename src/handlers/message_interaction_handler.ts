import { Handler } from '../classes/handler.js'
import fs from 'fs'
import { _dirname, GamerbotClient } from '../index.js'
import path from 'path'

/**
 * Loops over all message interaction files and imports them
 */
export default class MessageInteractionHandler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        const message_interactions_files_and_dirs = fs.readdirSync(
            path.join(_dirname, '/bot_interactions/message_interactions'),
            { withFileTypes: true },
        )
        //Get all directories
        const message_interaction_dirs = message_interactions_files_and_dirs.filter((file) =>
            file.isDirectory(),
        )
        //Get all files from top level
        const message_files = message_interactions_files_and_dirs
            .filter((file) => (file.name.endsWith('.ts') || file.name.endsWith(".js")) && !file.isDirectory())
            .map((file) => '../bot_interactions/message_interactions/' + file.name)
        //Get all files from sub directories
        for (const dir of message_interaction_dirs) {
            message_files.push(
                ...fs
                    .readdirSync(path.join(_dirname, '/bot_interactions/message_interactions/' + dir.name))
                    .filter((file) => file.endsWith('.ts') || file.endsWith(".js"))
                    .map(
                        (file) =>
                            '../bot_interactions/message_interactions/' +
                            dir.name +
                            '/' +
                            file,
                    ),
            )
        }
        //Import all files
        message_files.forEach((file) => {
            import(file).then((_message_interaction) => {
                const message = new _message_interaction.default()
                client.messageInteractions.set(message.name, message)
            })
        })
    }
}
