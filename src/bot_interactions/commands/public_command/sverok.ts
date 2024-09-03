import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, ComponentType, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Command } from "../../../classes/command";
import { GamerBotAPIInstance } from "../../..";
import { PorfileData } from "gamerbot-module";

export default class SverokCommand implements Command {
    name = "sverok";
    ephemeral = true;
    description = "Koppla ditt sverok konto till discord och få en cool sverok roll"
    aliases = [];
    data = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);
    async execute(interaction: CommandInteraction, profileData: PorfileData){
        const sverok_role_id = "1016685055357222942";
        const SVEROK_FRAME_ID = "19";
        let email_modal = new ModalBuilder()
            .setTitle("Sverok koppling")
            .setCustomId(`sverok:${interaction.id}`)
            .addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("email")
                        .setLabel("Här skriver du in din Email")
                        .setStyle(TextInputStyle.Short)
                )
            );
        
        let confermationButton = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ok")
                    .setLabel("Jag acceptera")
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Success)
            );
        const message = await interaction.editReply({content:"Hej innan du skriver in din mail så måste vi göra det tydligt att vi sparar din mailadress du skriver in på en intern hemlig lista. Vi sparar INTE vilket konto som skickat in vilken mailadress. Anledningen till att vi sparar är för att ingen mailadress ska kunna användas två gånger. Uppgifterna hanteras enligt GDPR. Mer information finns i https://docs.google.com/document/d/1PlTUOCm61SVMGd0nxxGWKIUSNuc-zK7lXdqecGZGJMs/edit?usp=sharing",components:[confermationButton]});
        message.awaitMessageComponent({componentType:ComponentType.Button,time:1000*5*60}).then(async (button)=>{
            await button.showModal(email_modal);
            const filter = (i:any) => i.customId.split(":")[1] === interaction.id;
            button.awaitModalSubmit({filter,time:1000*5*60}).then(async (modal)=>{
                const email = modal.fields.getTextInputValue("email");
                const TOKEN = process.env.SVEROK_API_TOKEN;
                
                const guild = await GamerBotAPIInstance.models.get_guild_data(interaction.guildId as string);

                if( guild.sverokMails.includes(email) ) return interaction.editReply("Denna mailadress är redan kopplad till en användare!");

                fetch("https://ebas.sverok.se/apis/confirm_membership.json",{
                    method:"POST",
                    headers:{
                        'content-type': 'application/json',
                    },
                    body:JSON.stringify({
                        request:{
                            action:"confirm_membership",
                            version:"1",
                            email:email,
                            association_number: "F220162-2",
                            year_id : new Date().getFullYear(),
                            api_key:TOKEN
                        }
                    })
                })
                .then(async (res)=>res.json())
                .then(async (data)=>{
                    if(data.response.member_found){
                        guild.sverokMails.push(email);
                        guild.save();
                        interaction.guild?.members.cache.get(interaction.user.id)?.roles.add(sverok_role_id);
                        button.reply("Ditt sverok konto är nu kopplat till discord och du har fått en sverok roll!");
                        if(!profileData.exclusiveFrames.includes(SVEROK_FRAME_ID)){
                            profileData.exclusiveFrames.push(SVEROK_FRAME_ID);
                            profileData.save();
                        }
                    }else{
                        data.reply("Du är inte medlem i sverok föreningen just nu!\nDu kan bli det med denna länk: https://ebas.sverok.se/blimedlem/SGC")
                    }
                }).catch((err)=>{})
            })
        })
    }
    
}