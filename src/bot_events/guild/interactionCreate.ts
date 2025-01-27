import {
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Interaction,
    TextChannel,
} from 'discord.js'
import { Event } from '../../classes/event.js'
import { Command } from '../../classes/command.js'
import { GamerBotAPIInstance, GamerbotClient } from '../../index.js'
import { Button } from '../../classes/button.js'

/**
 * InteractionCreate is called when a user interacts with the bot.
 * @param client - Discord client
 * @param interaction - Discord interaction
 */
export default class interactionCreate implements Event {
    constructor() {}
    run_event(client: Client, interaction: Interaction) {
        if(!interaction.inGuild()) return;
        if (interaction.isCommand()) {
            this.onCommand(
                interaction as CommandInteraction,
                client as GamerbotClient,
            )
        }
        if (interaction.isAutocomplete()) {
            this.onAutocomplete(
                interaction as AutocompleteInteraction,
                client as GamerbotClient,
            )
        }
        if (interaction.isButton()) {
            this.onButtonInteraction(
                interaction as ButtonInteraction,
                client as GamerbotClient,
            )
        }
    }

    private async onButtonInteraction(buttonInteraction: ButtonInteraction, client: GamerbotClient) {
        const button = client.buttons.get(
            buttonInteraction.customId.split(';')[0]
        ) as Button

        if (!button) return

        try {
            if (button.defer)
                await buttonInteraction.deferUpdate();
            const args = buttonInteraction.customId.split(';')
            args.shift()
            if(args.length === 0)
                button.execute(buttonInteraction, [])
            else
                button.execute(buttonInteraction, args)
        } catch (error) {
            console.error(error);
            (buttonInteraction.channel as TextChannel).send({
                content: 'There was an error while executing the button.'
            })
        }

    }

    private async onAutocomplete(
        interaction: AutocompleteInteraction,
        client: GamerbotClient,
    ) {
        let command: Command = client.commands.get(
            interaction.commandName,
        ) as Command
        if (!command) {
            client.commands.forEach((cmd) => {
                if (cmd.aliases.includes(interaction.commandName)) {
                    command = cmd
                }
            })
        }
        if (!command) return
        if (command.autoComplete) command.autoComplete(interaction)
    }

    private async onCommand(
        interaction: CommandInteraction,
        client: GamerbotClient,
    ) {
        let command: Command = client.commands.get(
            interaction.commandName,
        ) as Command
        if (!command) {
            client.commands.forEach((cmd) => {
                if (cmd.aliases.includes(interaction.commandName)) {
                    command = cmd
                }
            })
        }
        if (!command) return
        const profile_data = await GamerBotAPIInstance.models.get_profile_data(
            interaction.member?.user.id as string,
        )
        try {
            if (command.defer)
                await interaction.deferReply({ ephemeral: command.ephemeral })
            await command.execute(interaction, profile_data)
        } catch (error) {
            console.error(error);
            (interaction.channel as TextChannel).send({
                content: 'There was an error while executing this command.'
            })
        }
    }
}
