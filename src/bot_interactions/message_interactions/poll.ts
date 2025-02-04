import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction.js";

export default class Poll implements MessageInteraction {
    name = "(poll)";
    execute(interaction: Message) {
        const EMOJIREGEX =
            /((?<!\\)<:[^:]+:(\d+)>)|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gmu;

        let emojis = interaction.content.match(EMOJIREGEX);

        if (emojis == undefined) emojis = ["👍", "👎"];

        emojis.forEach(async (element) => {
            if (/\d/.test(element)) {
                interaction.guild?.emojis.cache.forEach((emojiID) => {
                    if (element.includes(emojiID.id) == true)
                        interaction.react(element);
                });
            } else {
                await interaction.react(element);
            }
        });
    }
}
