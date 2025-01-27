import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction.js";

export default class Gaming implements MessageInteraction {
    name = "gaming";
    execute(interaction: Message) {
        if(!interaction.channel.isSendable()) return;
        if (Math.floor(Math.random() * 100) > 86) {
            interaction.channel.send("**GAMING! 🎮**");
        }
    }
}