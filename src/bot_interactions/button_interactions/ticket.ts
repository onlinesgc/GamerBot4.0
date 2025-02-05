import {
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    CommandInteraction,
    GuildChannel,
    GuildMember,
    ModalSubmitInteraction,
    TextInputStyle,
    User,
} from "discord.js";
import { Button } from "../../classes/button.js";
import { GamerBotAPIInstance } from "../../index.js";
import NoteCommand from "../commands/admin_commands/note.js";
import { createButtonRow, createModal } from "../../functions/builder_functions.js";

export default class Ticket implements Button {
    name = "ticket";
    defer = false;
    execute(interaction: ButtonInteraction, args: string[]) {
        if (args[0] == "open")
            this.open_ticket(
                interaction,
                interaction.user,
                `Tack för att du öppnade en ticket! <@` +
                    interaction.user.id +
                    `> ! <@&1071466487069556746> kommer svara inom kort!`,
            );
        else if (args[0] == "close")
            this.close_ticket(
                interaction,
                args[1],
                args[2],
                JSON.parse(args[3]),
            );
        else if (args[0] == "note") this.note_ticket(interaction, args[2]);
        else if (args[0] == "archive")
            this.archive_ticket(interaction, args[2]);
    }

    async open_ticket(
        interaction: ButtonInteraction | CommandInteraction,
        ticketUser: User,
        open_ticket_text: string,
    ) {
        const guild_category = (
            await GamerBotAPIInstance.models.get_guild_data(
                interaction.guildId as string,
            )
        ).ticketParent;

        if (guild_category == null || guild_category == "") {
            interaction.reply("No ticket category set up");
            return;
        }

        const leave_ticket_row = createButtonRow(
            {
                style:ButtonStyle.Danger,
                label:"Lämna ticket",
                id:`ticket;close;${interaction.user.id};false`
            }
        );

        const ticket_modal = createModal(
            "Ticket",
            `ticket_help:${interaction.id}`,
            {
                label:"Skriv en beskrivning vad du behöver hjälp med",
                placeholder:"Skriv här...",
                style:TextInputStyle.Paragraph,
                text_id:`ticket_help_description:${interaction.id}`,
                requierd:true
            }
        );

        await interaction.showModal(ticket_modal);

        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;

        const modal_submit = await interaction.awaitModalSubmit({ filter, time: 1000 * 60 * 10 }).catch(() => {})
        if (!modal_submit) return;

        const description = modal_submit.fields.getTextInputValue(
            `ticket_help_description:${interaction.id}`,
        );

        const ticket_channel = await interaction.guild?.channels.create(
            {
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: guild_category,
                permissionOverwrites: [
                    {
                        id: interaction.guild?.roles.everyone.id,
                        deny: ["ViewChannel", "SendMessages"],
                        allow: ["AttachFiles"],
                    },
                    {
                        id: ticketUser.id,
                        allow: [
                            "ViewChannel",
                            "SendMessages",
                            "AttachFiles",
                        ],
                    },
                ],
            },
        );
        const message = await ticket_channel?.send({
            content: `${open_ticket_text}\nBeskrivningen för problemet är:\n\`${description}\``,
            components: [leave_ticket_row],
        });

        leave_ticket_row.components[0].setCustomId(
            `ticket;close;${message?.id};${interaction.user.id};false`,
        );

        await message?.edit({ components: [leave_ticket_row] });
        modal_submit.deferUpdate();

        return { channel: ticket_channel, interaction: interaction };
        
    }

    async close_ticket(
        interaction: ButtonInteraction,
        message_id: string,
        user_id: string,
        remove_ticket: boolean,
    ) {
        if (remove_ticket) {
            await interaction.reply("Tar bort kanalen om 5 sekunder...");
            setTimeout(async () => interaction.channel?.delete(), 5000);
            return;
        }
        const member = interaction.guild?.members.cache.get(user_id);
        const message = interaction.channel?.messages.cache.get(message_id);
        const channel = interaction.channel as GuildChannel;

        await channel?.permissionOverwrites.edit(member?.id as string, {
            ViewChannel: false,
            SendMessages: false,
            AttachFiles: false,
        });

        const close_row = createButtonRow(
            {emoji:"📝", style:ButtonStyle.Secondary, label:"Notera och radera", id:`ticket;note;${message_id};${user_id}`},
            {emoji:"💾", style:ButtonStyle.Secondary, label:"Notera och arkivera", id:`ticket;archive;${message_id};${user_id}`},
            {style:ButtonStyle.Danger, label:"Radera", id:`ticket;close;${message_id};${user_id};true`},
        );

        message?.reply({
            content: `Nu har <@${user_id}> lämnat ticketen. Vill ni spara, anteckna eller slänga ticketen?`,
            components: [close_row],
        });
        interaction.deferUpdate();
    }
    async note_ticket(interaction: ButtonInteraction, user_id: string) {
        await interaction.showModal(await this.get_modal());
        const modal_submit = await interaction.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => {});

        if (!modal_submit) return;

        const note = modal_submit.fields.getTextInputValue("noteid");
        const member = interaction.guild?.members.cache.get(
            user_id,
        ) as GuildMember;

        await new NoteCommand().noteUser(
            member,
            "[ticket note]" + note,
            interaction.user.id,
        );

        await modal_submit.reply(`Tar bort kanalen om 5 sekunder...`);

        setTimeout(() => interaction.channel?.delete(), 5000);
    }
    async archive_ticket(interaction: ButtonInteraction, user_id: string) {
        await interaction.showModal(await this.get_modal());
        const modal_submit = await interaction.awaitModalSubmit({ time: 60 * 1000 * 10 }).catch(() => {});

        if (!modal_submit) return;

        const note = modal_submit.fields.getTextInputValue("noteid");
        const member = interaction.guild?.members.cache.get(
            user_id,
        ) as GuildMember;

        await new NoteCommand().noteUser(
            member,
            "[ticket note]" + note,
            interaction.user.id,
        );

        const guildConfig =
            await GamerBotAPIInstance.models.get_guild_data(
                interaction.guildId as string,
            );
        if (!guildConfig.archivedTicketParent) {
            modal_submit.reply(
                "Det gick inte att arkivera ticketen eftersom att guild config värdet `archivedTicketParent` inte är definierat! Medlemmen noterades dock ändå.",
            );
            return;
        }

        await modal_submit.reply(`Arkiverar kanalen om 5 sekunder...`);
        setTimeout(async () => {
            await (interaction.channel as GuildChannel).setParent(
                guildConfig.archivedTicketParent,
            );
        }, 5000);
    }

    async get_modal() {
        return createModal("Add note", "noteadd", {label:"Add note",placeholder:"note...",style:TextInputStyle.Paragraph,text_id:"noteid", requierd:true});
    }
}
