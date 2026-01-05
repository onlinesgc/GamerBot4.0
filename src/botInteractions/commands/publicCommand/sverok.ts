import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, LabelBuilder, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../../../classes/command";
import { createHmac } from "crypto";
import { GamerBotAPIInstance } from "../../../index.js";
import { UserData } from "gamerbot-module";

export default class SverokCommand implements Command {
    name = "sverok";
    ephemeral = true;
    description =
        "Koppla ditt sverok konto till discord och få en cool sverok roll";
    aliases = [];
    defer = true;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: ChatInputCommandInteraction, userData: UserData) {
        const sverokRoleId = "1016685055357222942";
        const SVEROK_FRAME_ID = "19";
        const emailModal = new ModalBuilder().setCustomId(`sverok:${interaction.id}`).setTitle("Sverok koppling");

        const emailInput = new TextInputBuilder()
            .setCustomId("email")
            .setStyle(TextInputStyle.Short);
        
        const emailLabel = new LabelBuilder()
            .setLabel("Här skriver du in din Email")
            .setDescription("Ange din Sverok-registrerade e-postadress.")
            .setTextInputComponent(emailInput);

        emailModal.addLabelComponents(emailLabel);

        const confermationButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm")
                    .setLabel("Jag accepterar")
                    .setStyle(ButtonStyle.Success)
            );
        
        const message = await interaction.editReply({
            content:
                "Hej innan du skriver in din mail så måste vi göra det tydligt att vi sparar din mailadress igenom att kryptera den. Det betyder att vi inte kan se vilka mails vi har, men systemet kan fortfarande jämföra om du försker använda den igen. Anledningen till att vi sparar är för att ingen mailadress ska kunna användas två gånger. Uppgifterna hanteras enligt GDPR. Mer information finns i https://docs.google.com/document/d/1PlTUOCm61SVMGd0nxxGWKIUSNuc-zK7lXdqecGZGJMs/edit?usp=sharing",
            components: [confermationButton],
        });
        
        message.awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 1000 * 5 * 60,
        }).then(async (button) => {
            await button.showModal(emailModal);
            const filter = (i: ModalSubmitInteraction) => i.customId === `sverok:${interaction.id}`;
            const modalSubmit = await button.awaitModalSubmit({ filter, time: 1000 * 5 * 60 });

            const email = modalSubmit.fields.getTextInputValue("email");
            const SVEROK_TOKEN = process.env.SVEROK_API_TOKEN;

            const currentHash = createHmac('sha256', process.env.EMAIL_HASH_PEPPER || '').update(email).digest('hex');

            const guildConfig = await GamerBotAPIInstance.models.getGuildData(interaction.guild!.id);
            
            if (guildConfig.hashedEmails.includes(currentHash)) {
                await modalSubmit.reply({ content: "Denna mailadress är redan kopplad till ett konto.", ephemeral: true });
                return;
            }
            

            const data = await fetch("https://ebas.sverok.se/apis/confirm_membership.json", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    request: {
                        action: "confirm_membership",
                        version: "1",
                        email: email,
                        association_number: "F220162-2",
                        year_id: new Date().getFullYear(),
                        api_key: SVEROK_TOKEN,
                    }
                })
            }).catch(() => null);

            if (!data || !data.ok) {
                await modalSubmit.reply({ content: "Något gick fel vid kontakt med Sverok, försök igen senare.", ephemeral: true });
                return;
            }

            const jsonData = await data.json().catch(() => null);

            if (!jsonData) {
                await modalSubmit.reply({ content: "Något gick fel vid kontakt med Sverok, försök igen senare.", ephemeral: true });
                return;
            }

            if (jsonData.response.member_found) {
                guildConfig.hashedEmails.push(currentHash);
                await guildConfig.save();
                const member = await interaction.guild!.members.fetch(interaction.user.id);
                await member.roles.add(sverokRoleId, "Användaren har kopplat sitt sverok konto");
                if (!userData.frameData.frames.includes(SVEROK_FRAME_ID)) {
                    userData.frameData.frames.push(SVEROK_FRAME_ID);
                    await userData.save();
                }

                await modalSubmit.reply({ content: "Din mailadress är nu kopplad till ditt discordkonto och du har fått din roll!", ephemeral: true }); 
            } else {
                await modalSubmit.reply({ content: "Ingen medlem hittades med den mailadressen. Kontrollera att du angett rätt mailadress.\nOm du inte är medlem kan du bli det här: https://ebas.sverok.se/blimedlem/SGC", ephemeral: true });
            } 
        });
    }
}