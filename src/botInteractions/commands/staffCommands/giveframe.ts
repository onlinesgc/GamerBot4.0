import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../../index.js";
import { getAllFrames } from "../../../functions/getAllFrames.js";

export default class GiveFrameCommand implements Command<ChatInputCommandInteraction> {
    name = "giveframe";
    ephemeral = false;
    description = "Give a frame to a user";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user to give the frame to")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("frame")
                .setDescription("The frame to give")
                .setRequired(true)
                .setAutocomplete(true),
        )
        .addStringOption((option) =>
            option
                .setName("action")
                .setDescription("The action to perform")
                .setRequired(true)
                .addChoices(
                    { name: "add", value: "add" },
                    { name: "remove", value: "remove" },
                ),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.get("user", true).user;
        const frame = interaction.options.get("frame", true).value as string;
        const action = interaction.options.get("action", true).value as string;

        const frames = (
            await GamerBotAPIInstance.models.getGuildData(
                "516605157795037185",
            )
        ).frames;
        const frameData = frames.find(
            f => f.id.toString() === frame,
        );
        if (!frameData) {
            interaction.editReply("Frame not found");
            return;
        }
        const userData = await GamerBotAPIInstance.models.getUserData(user?.id as string);
        if (action === "add") {
            if (userData.frameData.frames.includes(frameData.id)) {
                interaction.editReply("User already has the frame");
                return;
            }
            userData.frameData.frames.push(frameData.id);
        } else {
            if (!userData.frameData.frames.includes(frameData.id)) {
                interaction.editReply("User does not have the frame");
                return;
            }
            userData.frameData.frames = userData.frameData.frames.filter(
                f => f !== frameData.id,
            );
        }
        userData.save();
        interaction.editReply("Frame added/removed");
    }

    async autoComplete(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused(true);
        if (focusedValue === null) {
            return;
        }
        let choises = await getAllFrames(
            "516605157795037185",
            interaction.client as GamerbotClient,
        );
        choises = choises.slice(10, choises.length);
        const filtered = choises.filter((choise) =>
            choise.name.includes(focusedValue.value),
        );

        let options;
        if (filtered.length > 25) {
            options = filtered.slice(0, 25);
        } else {
            options = filtered;
        }

        await interaction.respond(options);
    }
}
