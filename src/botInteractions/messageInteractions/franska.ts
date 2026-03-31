import { Message } from "discord.js";
import { MessageInteraction } from "../../classes/messageInteraction.js";

const frenchGifs = [
    "https://images-ext-1.discordapp.net/external/rqSI_LCceYOruQRgxtUt57xm-t61gqOpU7tjyH1N7qA/https/media.tenor.com/KRoG16fK32cAAAPo/kravatie-kravate.mp4",
    "https://images-ext-1.discordapp.net/external/odsNm-zcVFkABQD8nzjWab9pn3S0A1NZddevokVEbFo/https/media.tenor.com/t1yifm4lA54AAAPo/le-fishe.mp4",
    "https://images-ext-1.discordapp.net/external/XrjPmi1hn8TTfhPcHx0VcRCkh2bHg8Dn4T359T8VLfI/https/media.tenor.com/73WoNZZmig8AAAPo/emmanuel-macron.mp4",
    "https://images-ext-1.discordapp.net/external/1jkGc-T7EPbaJahtPkPDilv4RYiv6iwEuHbaHzcBNg8/https/media.tenor.com/CwVA6loq7qMAAAPo/cat-meme-french.mp4",
    "https://images-ext-1.discordapp.net/external/EoZ03fTV89Cr6sEjSRXKW3wXc9-qhHKTrzuxSP4Yets/https/media.tenor.com/FqaZJeQL4cAAAAPo/tintin-theadventuresoftintin.mp4",
];

export default class Franska implements MessageInteraction {
    name = "franska";
    aliases = ["french", "fransk", "français"];
    execute(interaction: Message) {
        if (!interaction.channel.isSendable()) return;
        const randomGif =
            frenchGifs[Math.floor(Math.random() * frenchGifs.length)];
        interaction.channel.send({ files: [randomGif] });
    }
}
