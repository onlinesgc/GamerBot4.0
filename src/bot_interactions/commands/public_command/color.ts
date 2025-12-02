import {
    SlashCommandBuilder,
    GuildMemberRoleManager,
    ChatInputCommandInteraction,
} from "discord.js";
import { Command } from "../../../classes/command.js";

const ROLES_PERMISSION = [
    "821044349290807326", // Färg
    "821043692747358298", // Bilder och länkar
    "821043682970697818", // Skärmdela
    "870289214556758077", // Smeknamn
    "818809151257575464", // Trusted
    "821059798270214176", // Cool häsits
    "812324460429836318", // Trusted gamer
    "1082393287731708015", //lvl 20
];

const ROLES = {
    Druva: "930516179980812348",
    Äpple: "812869730082881586",
    Apelsin: "811234326741254175",
    Citron: "812868303995273266",
    Persika: "812868301541605376",
    Smultron: "847821007812952095",
    Blomkål: "1001770913877999687",
    Gurka: "812868297628057600",
    Päron: "812869251458531351",
    Blåbär: "847822108108521523",
    Säsongsrollen: "893819391517556736",
};

const formattedRoles: any[] = [];
for (const roleName in ROLES) {
    const role = ROLES[roleName as keyof typeof ROLES];

    formattedRoles.push({
        name: roleName,
        value: role,
    });
}

export default class ColorCommand implements Command {
    name = "color";
    ephemeral = false;
    description = "Ändra din färg ifall du är i tillräckligt hög level";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
            option
                .setName("färg")
                .setDescription(
                    "Välj vilken färg du vill ha, lämna denna blank ifall du vill ta bort din roll",
                )
                .setRequired(false)
                .addChoices(formattedRoles),
        );
    async execute(interaction: ChatInputCommandInteraction) {
        //eslint-disable-next-line
        const roleOption = interaction.options.get(
            "färg",
            false,
        ) as unknown as any;

        if (interaction.member == null) return;

        if (
            !(interaction.member.roles as GuildMemberRoleManager).cache.hasAny(
                ...ROLES_PERMISSION,
            )
        ) {
            interaction.editReply({
                content:
                    "Du har inte tillräckligt hög level för att ändra din färg!",
            });
            return;
        }

        const rolesArray = [];
        for (const roleId of Object.values(ROLES)) {
            if (
                (interaction.member.roles as GuildMemberRoleManager).cache.has(
                    roleId,
                )
            ) {
                rolesArray.push(roleId);
            }
        }

        await (interaction.member.roles as GuildMemberRoleManager).remove(
            rolesArray,
        );

        if (!roleOption) {
            interaction.editReply({ content: "Din färg har tagits bort!" });
            return;
        }

        await (interaction.member.roles as GuildMemberRoleManager).add(
            roleOption.value,
        );

        interaction.editReply({
            content: `Gav dig rollen <@&${roleOption.value}>!`,
        });
    }
}
