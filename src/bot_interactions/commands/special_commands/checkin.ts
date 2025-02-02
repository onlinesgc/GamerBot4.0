import { SlashCommandBuilder, CommandInteraction, GuildMemberRoleManager, ModalBuilder, TextInputBuilder, ActionRow, ActionRowBuilder, TextInputStyle } from "discord.js";
import { Command } from "../../../classes/command.js";
import { GamerBotAPIInstance } from "../../../index.js";

const SVEROK_ID = "1013577257870184559";
const CHECKIN_ID = "956580014302826506";

export default class CheckinCommand implements Command {
    name = "checkin";
    ephemeral = true;
    description = "Checka in i onlineföreningen SGCs årsmöte";
    aliases = [];
    defer = false;
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute (interaction: CommandInteraction) {
        if(interaction.member == null) return;

        if(!(interaction.member.roles as GuildMemberRoleManager).cache.has(SVEROK_ID)){
            interaction.reply({content: "Du är inte föreningsmedlem, eller har inte rollen i discord. Bli medlem på https://blimedlem.sgc.se/ , bli medlem och gör sedan kommandot /sverok för att bekräfta ditt medlemskap i discord", ephemeral: true});
            return;
        }

        if((interaction.member.roles as GuildMemberRoleManager).cache.has(CHECKIN_ID)){
            interaction.reply({content: "Du har redan checkat in", ephemeral: true});
            return;
        }

        const email_modal = new ModalBuilder()
            .setTitle("Skriv in ditt namn")
            .setCustomId("checkin:namn")
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("firstname")
                        .setLabel("skriv in ditt namn här")
                        .setPlaceholder("förnamn")
                        .setStyle(TextInputStyle.Short)
                ),
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("lastname")
                        .setLabel("skriv in ditt efternamn här")
                        .setPlaceholder("efternamn")
                        .setStyle(TextInputStyle.Short)
                )
            );
        
        interaction.showModal(email_modal);
        const modal = await interaction.awaitModalSubmit({time: 1000 * 60 * 5}).catch(() => {});
        if(modal == null) {
            interaction.reply({content: "Tiden för att svara har gått ut", ephemeral: true});
            return;
        }
        const firstname = modal.fields.getTextInputValue("firstname").toLowerCase();
        const lastname = modal.fields.getTextInputValue("lastname").toLowerCase();
        
        const res = await fetch(`https://ebas.sverok.se/apis/confirm_membership.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                request:{
                    action: "confirm_membership",
                    association_number: "F220162-2",
                    year_id: new Date().getFullYear(),
                    api_key: process.env.SVEROK_API_TOKEN,
                    firstname:firstname,
                    lastname:lastname,
                }
            })
        }).catch(() => {});

        if(res == null) {
            modal.reply({content: "Något gick fel, försök igen senare", ephemeral: true});
            return;
        }

        const data = await res.json();

        if(!data.response.member_found){
            modal.reply({content: "Ditt namn matchade inte med något medlemskap, försök igen", ephemeral: true});
            return;
        }

        const guild_data = await GamerBotAPIInstance.models.get_guild_data(interaction.guildId as string)
        let checkin_data;
        if(!guild_data.extraObjects.has("checkin")){
            await this.setValue(interaction.guildId as string, []);
            checkin_data = [] as Array<any>;
        }else{
            checkin_data = guild_data.extraObjects.get("checkin") as Array<any>;
        }

        if(checkin_data.find((checkin) => checkin.name == `${firstname} ${lastname}`)){
            modal.reply({content: "Denna person har redan checkat in", ephemeral: true});
            return;
        }

        modal.reply({content: "Du är nu incheckad i årsmötet", ephemeral: true});

        checkin_data.push({
            name: `${firstname} ${lastname}`,
            username: interaction.user.username,
            timestamp: Date.now(),
        });
        await this.setValue(interaction.guildId as string, checkin_data);

        await (interaction.member.roles as GuildMemberRoleManager).add(CHECKIN_ID)
    }

    async setValue(guild_id:string, value:Array<any>){
        await fetch(`https://api.sgc.se/api/guild/${guild_id}/add_obj`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + process.env.GAMERBOT_API_TOKEN,
            },
            body: JSON.stringify({
                key: "checkin",
                value: value,
            })
        })
    }
    
}