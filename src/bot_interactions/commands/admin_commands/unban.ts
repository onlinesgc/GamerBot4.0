import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { ModLog } from "../../../classes/modlog";
import { CreateModLogEmbed } from "../../../functions/createEmbed";

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
        .addUserOption((option) => option.setName("user").setDescription("Personen du vill unbanna").setRequired(true))
        .addStringOption((option) => option.setName("reason").setDescription("Anledning till unbannet").setRequired(true));
    async execute (interaction: CommandInteraction){
        const user = interaction.options.get("user", true).user;
        const reason = interaction.options.get("reason", true).value as string;
        if(!user) return interaction.editReply("Användaren finns inte");

        const ban = await interaction.guild?.bans.fetch(user.id);
        if(!ban) return interaction.editReply("Användaren är inte bannad");

        const [has_sent_message, is_unbaned] = await this.unBan(user, reason, interaction.user.id, interaction);
        
        if(is_unbaned === undefined || is_unbaned == null) return interaction.editReply("Kunde inte unbanna användaren");

        const embed = CreateModLogEmbed(
            "unban",
            `${user.tag} har unbannats`,
            reason,
            this.name,interaction,
            has_sent_message as boolean);

        interaction.editReply({embeds: [embed]});
    }
    async unBan(user: User, reason:string, authorId:string, interaction:CommandInteraction){
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(user.id);
        const modlog = new ModLog("unban",user.id,user.username,reason,null,Date.now(),authorId);

        profile_data.modLogs.push(modlog);
        profile_data.save();

        let has_sent_message = true;

        await user.send(`Du har blivit unbannad i SGC.\nAnledningen är **${reason}**\nhttps://discord.sgc.se to join`).catch(() => has_sent_message = false);

        const is_unbaned = await interaction.guild?.members.unban(user.id);

        return [has_sent_message, is_unbaned]
    }
}