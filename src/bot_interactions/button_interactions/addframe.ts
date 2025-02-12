import { ButtonInteraction } from "discord.js";
import { Button } from "../../classes/button.js";
import { GamerBotAPIInstance } from "../../index.js";

export default class AddFrame implements Button {
    name = "addframe";
    defer = true;
    async execute(interaction: ButtonInteraction, args: string[]) {
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            interaction.user.id,
        );
        const guild_data =
            await GamerBotAPIInstance.models.get_guild_data(
                "516605157795037185",
            );
        const has_frame = profile_data.exclusiveFrames.find(
            (frame) => frame == (parseInt(args[0])-10).toString(),
        );
        if (has_frame == undefined) {
            profile_data.exclusiveFrames.push((parseInt(args[0])-10).toString());
            await profile_data.save();
            interaction.user.send("Du har fått en ny ram!").catch(() => {});
            return;
        } else {
            //eslint-disable-next-line
            interaction.user.send(
                `Du har redan fått ${(guild_data.frameConfig[parseInt(args[0])] as any).name}!`,
            ).catch(() => {});
            return;
        }
    }
}
