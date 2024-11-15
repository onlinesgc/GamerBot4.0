import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction";
import { getRndInteger } from "../../functions/getRndInt";

export default class GamerBotMessageInteraction implements MessageInteraction {
    name = "gamerbot";
    execute (interaction: Message){
        const random_messages =  ["Hej hej mitt namn är gamerbot", "Pratar ni om mig?!?", "Vad hittas på här då?", "Mycket trevligt sagt","Gamerbot är mycket cool och jag kan lösa vad som helst!","Jag vet inte vad jag ska svara :0","<:Gamerbot:895995193579417601>","Kanonkul!","Bara på tisdagar!","Beep boop!","Skriv /lvl i botkommandon för att kolla din level!","Visste ni att SGC har en Sverokförening inne på https://ebas.sverok.se/blimedlem/SGC?","Sverok medlemmar får tillgång till en egen kategori där vi brukar ha event varje söndag!\nhttps://blimedlem.sgc.se","Gamerbot? Det är ju jag!","Hejjjjj!","Visste ni att all info om servern och om mitt XP-system finns att läsa i <#941098239472582716>?","Hörde jag mitt namn?","Ok"];
        if(getRndInteger(0,10) > 5){
            interaction.channel.send(random_messages[getRndInteger(0,random_messages.length-1)]);
        }
    }
    
}