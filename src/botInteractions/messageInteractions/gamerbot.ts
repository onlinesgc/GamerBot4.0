import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction.js";
import { getRndInteger } from "../../functions/getRndInt.js";

export default class GamerBotMessageInteraction implements MessageInteraction {
    name = "gamerbot";
    execute(interaction: Message) {
        if (!interaction.channel.isSendable()) return;
        const random_messages = [
            "Salut salut, mon nom est Gamerbot",
            "Vous parlez de moi ?!?",
            "Qu'est-ce qui se passe par ici ?",
            "C'est très gentiment dit",
            "Gamerbot est trop cool et je peux tout résoudre !",
            "Je ne sais pas quoi répondre :0",
            "<:Gamerbot:895995193579417601>",
            "Super sympa !",
            "Seulement les mardis !",
            "Bip boup !",
            "Tapez /lvl dans bot-commandes för att kolla din level!",
            "Saviez-vous que SGC a une association Sverok sur https://ebas.sverok.se/blimedlem/SGC ?",
            "Les membres de Sverok ont accès à une catégorie exclusive où nous organisons des événements tous les dimanches !\nhttps://blimedlem.sgc.se",
            "Gamerbot ? C'est moi !",
            "Saluuuuut !",
            "Saviez-vous que toutes les infos sur le serveur et sur mon système d'XP sont disponibles dans <#941098239472582716> ?",
            "J'ai entendu mon nom ?",
            "Ok",
        ];
        if (getRndInteger(0, 10) > 5) {
            interaction.channel.send(
                random_messages[getRndInteger(0, random_messages.length - 1)],
            );
        }
    }
}
