import { ButtonInteraction } from "discord.js";
import { Button } from "../../classes/button.js";
import { GamerBotAPIInstance } from "../../index.js";

export default class AddFrame implements Button {
    name = "addframe";
    defer = true;
    async execute(interaction: ButtonInteraction, args: string[]) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            interaction.user.id,
        );
        const guildData =
            await GamerBotAPIInstance.models.getGuildData(
                "516605157795037185",
            );
        const hasFrame = userData.frameData.frames.find(
            (frame) => frame == args[0],
        );
        if (hasFrame == undefined) {
            userData.frameData.frames.push(args[0]);
            await userData.save();
            interaction.user.send("Du har fått en ny ram!").catch(() => {});
            return;
        } else {
            //eslint-disable-next-line
            interaction.user.send(
                `Du har redan fått ${(guildData.frames[parseInt(args[0])] as any).name}!`,
            ).catch(() => {});
            return;
        }
    }
}
