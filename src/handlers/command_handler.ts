import { Handler } from '../classes/handler'
import fs from 'fs'
import { GamerbotClient } from '..'

/**
 * Loops over all command files and imports them
 */
export default class command_handler implements Handler {
    constructor() {}
    async run(client: GamerbotClient) {
        const command_files_and_dirs = fs.readdirSync(
            './src/bot_interactions/commands',
            { withFileTypes: true },
        )
        //Get all directories
        const command_dirs = command_files_and_dirs.filter((file) =>
            file.isDirectory(),
        )
        //Get all files from top level
        const command_files = command_files_and_dirs
            .filter((file) => file.name.endsWith('.ts') && !file.isDirectory())
            .map((file) => '../bot_interactions/commands/' + file.name)
        //Get all files from sub directories
        for (const dir of command_dirs) {
            command_files.push(
                ...fs
                    .readdirSync('./src/bot_interactions/commands/' + dir.name)
                    .filter((file) => file.endsWith('.ts'))
                    .map(
                        (file) =>
                            '../bot_interactions/commands/' +
                            dir.name +
                            '/' +
                            file,
                    ),
            )
        }
        //Import all files
        command_files.forEach((file) => {
            import(file).then((_command) => {
                const command = new _command.default()
                client.commands.set(command.name, command)
                command.aliases.forEach((alias: object) => {
                    const alias_command = command.data.toJSON()
                    alias_command.name = alias
                    client.command_array.push(alias_command)
                })
                client.command_array.push(command.data.toJSON())
            })
        })
    }
}
