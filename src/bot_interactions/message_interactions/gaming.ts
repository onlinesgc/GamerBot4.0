import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction";

export default class Gaming implements MessageInteraction {
    name = "gaming";
    execute(interaction: Message) {
        if (Math.floor(Math.random() * 100) > 86) {
            interaction.channel.send("**GAMING! 🎮**");
        }
    }
}