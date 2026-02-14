import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMemberRoleManager, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, ModalSubmitInteraction } from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../../index.js";

export default class CheckInCommand implements Command<ChatInputCommandInteraction> {
    name = "checkin";
    ephemeral = true;
    description = "Checka in i årsmötet!";
    aliases = [];
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.inGuild()) return;

        if(!(interaction.member.roles as GuildMemberRoleManager).cache.has("1016685055357222942")) 
            return interaction.reply("Du måste vara medlem i föreningen för att checka in!");

        if((interaction.member.roles as GuildMemberRoleManager).cache.has("1468327480611045396")) 
            return interaction.reply("Du är redan incheckad!");

        const emailInput = new TextInputBuilder()
            .setCustomId("email")
            .setStyle(TextInputStyle.Short);

        const emailLabel = new LabelBuilder()
            .setLabel("Här skriver du in din Email")
            .setDescription("Ange din Sverok-registrerade e-postadress.")
            .setTextInputComponent(emailInput);

        const firstName = new TextInputBuilder()
            .setCustomId("firstName")
            .setStyle(TextInputStyle.Short);

        const firstNameLabel = new LabelBuilder()
            .setLabel("Här skriver du in ditt förnamn")
            .setDescription("Ange ditt förnamn som registrerat hos Sverok.")
            .setTextInputComponent(firstName);

        const lastName = new TextInputBuilder()
            .setCustomId("lastName")
            .setStyle(TextInputStyle.Short);

        const lastNameLabel = new LabelBuilder()
            .setLabel("Här skriver du in ditt efternamn")
            .setDescription("Ange ditt efternamn som registrerat hos Sverok.")
            .setTextInputComponent(lastName);

        const modal = new ModalBuilder();
        modal.setCustomId('checkinModal');
        modal.setTitle('Checka in i årsmötet');
        modal.addLabelComponents(firstNameLabel, lastNameLabel, emailLabel);
        
        await interaction.showModal(modal);

        const filter = (i: ModalSubmitInteraction) => i.customId === 'checkinModal';

        const modalSubmit =  await interaction.awaitModalSubmit({ filter, time: 1000 * 5 * 60 }).catch(() => null);

        if (!modalSubmit) {
            await interaction.followUp({ content: "Tiden för att fylla i mailet har gått ut, försök igen.", ephemeral: true });
            return;
        }
        
        const email = modalSubmit.fields.getTextInputValue("email");
        const firstNameValue = modalSubmit.fields.getTextInputValue("firstName");
        const lastNameValue = modalSubmit.fields.getTextInputValue("lastName");

        const SVEROK_TOKEN = process.env.SVEROK_API_TOKEN;

        const jsonData = await fetch(`https://ebas.sverok.se/apis/confirm_membership.json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    request: {
                        action: "confirm_membership",
                        version: "1",
                        email: email,
                        firstname: firstNameValue,
                        lastname: lastNameValue,
                        association_number: "F220162-2",
                        year_id: new Date().getFullYear(),
                        api_key: SVEROK_TOKEN,
                    }
                })
            }
        );

        const data = await jsonData.json().catch(() => null);

        if (!data) {
            await modalSubmit.reply({ content: "Något gick fel vid kontakt med Sverok, försök igen senare.", ephemeral: true });
            return;
        }

        if (!data.response.member_found) {
            await modalSubmit.reply({ content: "Ingen medlem hittades med denna emailadress.", ephemeral: true });
            return;
        }

        const guildData = await GamerBotAPIInstance.models.getGuildData(interaction.guildId);

        const checkedInEmails: Array<{email: string, firstName: string, lastName: string, username: string}> = guildData.extraObjects.get("checkedInEmails") as Array<{email: string, firstName: string, lastName: string, username: string}> || [];

        if (checkedInEmails.some(entry => entry.email === email)) {
            await modalSubmit.reply({ content: "Denna email har redan checkat in!", ephemeral: true });
            return;
        }
        
        checkedInEmails.push(
            {
                email: email,
                username: interaction.user.username,
                firstName: firstNameValue,
                lastName: lastNameValue,
            }
        );

        guildData.extraObjects.set("checkedInEmails", checkedInEmails);

        await guildData.save();

        await modalSubmit.reply({ content: `Du är nu incheckad! Välkommen till årsmötet!`, ephemeral: true });

        (interaction.member.roles as GuildMemberRoleManager).add("1468327480611045396");

    }
}