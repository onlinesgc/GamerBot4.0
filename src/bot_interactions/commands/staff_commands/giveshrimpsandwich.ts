import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../../classes/command.js";

export default class giveshrimpsandwich implements Command{
    name = 'giveshrimpsandwich'
    ephemeral = false
    defer = true
    description = 'Lägger till räckmacke rollen till en användare'
    aliases = []
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('Personen som ska få räckmackan')
                .setRequired(true),
        )
    async execute(interaction: CommandInteraction) {
        const user = interaction.options.get('user', true).user;
        if(user == null) return interaction.editReply('Användaren finns inte');
        interaction.guild?.members.cache.get(user.id)?.roles.add('872157696709783552');
        user.send("Välkommen till Trusted! Skriv ditt namn i <#820653699557883934> för att gå tillgång till Minecraftservern! - Du har fått en räkmacka i SGC, det betyder att du fått glida in på Trusted, på en räkmacka. **Det är väldigt hemligt för de som inte är Trusted!!** Om du själv vill veta hur du fått din räkmacka kan du fråga någon Trusted-person i Trusteds voice-kanal!")
            .catch(() => interaction.editReply('Användaren har stängt DMs'));
        interaction.editReply('Räckmackan har lagts till!');
    }
}