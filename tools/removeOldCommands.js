// This is a miniature bot to clear the cached commands for the bot configured in the .env
// Useful for when discord starts to mistake one command for another

// Usage:
// In project root type:
//    node tools/deleteAllCommands.js [clientID] [guildID]
// Where:
//    clientID - the discord ID of the bot
//    guildID - the discord ID of the server where the commands reside

import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

const cmdArgs = process.argv.slice(2);

if (cmdArgs.length === 2) {
    // replaces the list of commands with an empty list
    rest.put(Routes.applicationGuildCommands(cmdArgs[0], cmdArgs[1]), { body: [] })
        .then(() => console.log('Successfully deleted all guild commands.'))
        .catch(console.error);

    rest.put(Routes.applicationCommands(cmdArgs[0]), { body: [] })
        .then(() => console.log('Successfully deleted all global commands.'))
        .catch(console.error);
} else {
    console.log("Usage: node tools/removeAllCommands.js [clientID] [guildID]");
}