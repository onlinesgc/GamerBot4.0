import { Client, CommandInteraction, Interaction } from "discord.js";
import { Event } from "../../classes/event";
import { Command } from "../../classes/command";
import { GamerBotAPIInstance, GamerbotClient } from "../..";
import { PorfileData } from "gamerbot-module/dist/classes/profile_data";

export default class interactionCreate implements Event{
    constructor(){};
    run_event(client:Client, interaction:Interaction){
        if(interaction.isCommand()){
            this.onCommand(interaction as CommandInteraction,client as GamerbotClient);
        }
    }
    private async onCommand(interaction:CommandInteraction, client:GamerbotClient) {
        let command : Command = client.commands.get(interaction.commandName) as Command;
        if(!command) {
            client.commands.forEach((cmd) => {
                if(cmd.aliases.includes(interaction.commandName)){
                    command = cmd;
                }
            });
        }
        if(!command) return;
        let profileData : PorfileData = await GamerBotAPIInstance.models.get_profile_data(interaction.member?.user.id as string);
        try{
            await interaction.deferReply({ephemeral:command.ephemeral});
            await command.execute(interaction,profileData);
        }catch(error){
            console.error(error);
            interaction.reply({content:"There was an error while executing this command.", ephemeral:true});
        }
    }
}