import { Client, CommandInteraction, Interaction } from "discord.js";
import { Event } from "../../classes/event";
import { Command } from "../../classes/command";
import { GamerBotAPIInstance, GamerbotClient } from "../..";
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
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(interaction.member?.user.id as string);
        try{
            await interaction.deferReply({ephemeral:command.ephemeral});
            await command.execute(interaction,profile_data);
        }catch(error){
            console.error(error);
            interaction.reply({content:"There was an error while executing this command.", ephemeral:true});
        }
    }
}