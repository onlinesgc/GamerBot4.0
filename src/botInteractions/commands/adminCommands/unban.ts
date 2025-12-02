import {
    ChatInputCommandInteraction,
    CommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    User,
} from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";
import { ModLog } from "../../../classes/modlog.js";
import { CreateModLogEmbed } from "../../../functions/builderFunctions.js";

export default class UnbanCommand implements Command {
    name = "unban";
    ephemeral = false;
    defer = true;
    description = "Unbannar en användare";
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("Personen du vill unbanna")
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Anledning till unbannet")
                .setRequired(true),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.get("user", true).user;
        const reason = interaction.options.get("reason", true).value as string;
        if (!user) return interaction.editReply("Användaren finns inte");

        const ban = await interaction.guild?.bans.fetch(user.id);
        if (!ban) return interaction.editReply("Användaren är inte bannad");

        const [hasSentMessage, isUnbaned] = await this.unBan(
            user,
            reason,
            interaction.user.id,
            interaction,
        );

        if (isUnbaned === undefined || isUnbaned == null)
            return interaction.editReply("Kunde inte unbanna användaren");

        const embed = CreateModLogEmbed(
            "unban",
            `${user.tag} har unbannats`,
            reason,
            this.name,
            interaction,
            hasSentMessage as boolean,
        );

        interaction.editReply({ embeds: [embed] });
    }
    async unBan(
        user: User,
        reason: string,
        authorId: string,
        interaction: CommandInteraction,
    ) {
        const userData = await GamerBotAPIInstance.models.getUserData(
            user.id,
        );
        const modlog = new ModLog(
            "unban",
            user.id,
            user.username,
            reason,
            null,
            Date.now(),
            authorId,
        );

        userData.modLogs.push(modlog);
        userData.save();

        let hasSentMessage = true;

        await user
            .send(
                `Du har blivit unbannad i SGC.\nAnledningen är **${reason}**\nhttps://discord.sgc.se to join`,
            )
            .catch(() => (hasSentMessage = false));

        const isUnbaned = await interaction.guild?.members.unban(user.id);

        return [hasSentMessage, isUnbaned];
    }
}
