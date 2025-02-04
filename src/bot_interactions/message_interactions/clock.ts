import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction.js";

export default class ClockInteraction implements MessageInteraction {
    name = "vad är klockan";
    execute(interaction: Message) {
        if (!interaction.channel.isSendable()) return;
        if (!interaction.mentions.has(interaction.client.user)) return;

        if (Math.floor(Math.random() * 100) > 91) {
            interaction.channel.send("**KLOCKAN TOLV!**");
        } else {
            const currentdate = new Date();
            const datetime =
                ("0" + currentdate.getHours()).slice(-2) +
                ":" +
                ("0" + currentdate.getMinutes()).slice(-2) +
                ":" +
                ("0" + currentdate.getSeconds()).slice(-2);
            if (
                currentdate.getHours() == 13 &&
                currentdate.getMinutes() == 37 &&
                currentdate.getSeconds() == 37
            )
                interaction.channel.send(
                    `<a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594>**Klockan är 13:37:37!**<a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594><a:vibecat:813405042887491594>`,
                );
            else interaction.channel.send(`Klockan är ${datetime}`);
        }
    }
}
