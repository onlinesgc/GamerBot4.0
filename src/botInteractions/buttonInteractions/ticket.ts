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
import NoteCommand from "../commands/adminCommands/note.js";
import { createButtonRow, createModal } from "../../functions/builderFunctions.js";

export default class Ticket implements Button {
    name = "ticket";
    defer = false;
    execute(interaction: ButtonInteraction, args: string[]) {
        if (args[0] == "open")
            this.openTicket(
                interaction,
                interaction.user,
                `Tack för att du öppnade en ticket! <@` +
                    interaction.user.id +
                    `> ! <@&1071466487069556746> kommer svara inom kort!`,
            );
        else if (args[0] == "close")
            this.closeTicket(
                interaction,
                args[1],
                args[2],
                JSON.parse(args[3]),
            );
        else if (args[0] == "note") this.noteTicket(interaction, args[2]);
        else if (args[0] == "archive")
            this.archiveTicket(interaction, args[2]);
    }

    async openTicket(
        interaction: ButtonInteraction | CommandInteraction,
        ticketUser: User,
        openTicketText: string,
    ) {
        const guildCategory = (
            await GamerBotAPIInstance.models.getGuildData(
                interaction.guildId as string,
            )
        ).ticketData.ticketCategoryId;

        if (guildCategory == null || guildCategory == "") {
            interaction.reply("No ticket category set up");
            return;
        }

        const leaveTicketRow = createButtonRow(
            {
                style:ButtonStyle.Danger,
                label:"Lämna ticket",
                id:`ticket;close;${interaction.user.id};false`
            }
        );

        const ticketModal = createModal(
            "Ticket",
            `ticket_help:${interaction.id}`,
            {
                label:"Skriv en beskrivning vad du behöver hjälp med",
                placeholder:"Skriv här...",
                style:TextInputStyle.Paragraph,
                textId:`ticket_help_description:${interaction.id}`,
                requierd:true
            }
        );

        await interaction.showModal(ticketModal).catch(() => {});

        const filter = (i: ModalSubmitInteraction) =>
            i.customId.split(":")[1] === interaction.id;

        const modalSubmit = await interaction.awaitModalSubmit({ filter, time: 1000 * 60 * 10 }).catch(() => {})
        if (!modalSubmit) return;

        const description = modalSubmit.fields.getTextInputValue(
            `ticket_help_description:${interaction.id}`,
        );

        const ticketChannel = await interaction.guild?.channels.create(
            {
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: guildCategory,
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
        const message = await ticketChannel?.send({
            content: `${openTicketText}\nBeskrivningen för problemet är:\n\`${description}\``,
            components: [leaveTicketRow],
        });

        leaveTicketRow.components[0].setCustomId(
            `ticket;close;${message?.id};${interaction.user.id};false`,
        );

        await message?.edit({ components: [leaveTicketRow] });
        modalSubmit.deferUpdate();

        return { channel: ticketChannel, interaction: interaction };
        
    }

    async closeTicket(
        interaction: ButtonInteraction,
        messageId: string,
        userId: string,
        removeTicket: boolean,
    ) {
        if (removeTicket) {
            await interaction.reply("Tar bort kanalen om 5 sekunder...");
            setTimeout(async () => interaction.channel?.delete(), 5000);
            return;
        }
        const member = interaction.guild?.members.cache.get(userId);
        const message = interaction.channel?.messages.cache.get(messageId);
        const channel = interaction.channel as GuildChannel;

        if (member){
            await channel?.permissionOverwrites.edit(member?.id as string, {
                ViewChannel: false,
                SendMessages: false,
                AttachFiles: false,
            });
        }
        const closeRow = createButtonRow(
            {emoji:"📝", style:ButtonStyle.Secondary, label:"Notera och radera", id:`ticket;note;${messageId};${userId}`},
            {emoji:"💾", style:ButtonStyle.Secondary, label:"Notera och arkivera", id:`ticket;archive;${messageId};${userId}`},
            {style:ButtonStyle.Danger, label:"Radera", id:`ticket;close;${messageId};${userId};true`},
        );

        message?.reply({
            content: `Nu har <@${userId}> lämnat ticketen. Vill ni spara, anteckna eller slänga ticketen?`,
            components: [closeRow],
        });
        interaction.deferUpdate();
    }
    async noteTicket(interaction: ButtonInteraction, userId: string) {
        await interaction.showModal(await this.getModal());
        const modalSubmit = await interaction.awaitModalSubmit({ time: 1000 * 60 * 10 }).catch(() => {});

        if (!modalSubmit) return;

        const note = modalSubmit.fields.getTextInputValue("noteid");
        const member = interaction.guild?.members.cache.get(
            userId,
        ) as GuildMember;

        await new NoteCommand().noteUser(
            member,
            "[ticket note]" + note,
            interaction.user.id,
        );

        await modalSubmit.reply(`Tar bort kanalen om 5 sekunder...`);

        setTimeout(() => interaction.channel?.delete(), 5000);
    }
    async archiveTicket(interaction: ButtonInteraction, userId: string) {
        await interaction.showModal(await this.getModal());
        const modalSubmit = await interaction.awaitModalSubmit({ time: 60 * 1000 * 10 }).catch(() => {});

        if (!modalSubmit) return;

        const note = modalSubmit.fields.getTextInputValue("noteid");
        const member = interaction.guild?.members.cache.get(
            userId,
        ) as GuildMember;

        await new NoteCommand().noteUser(
            member,
            "[ticket note]" + note,
            interaction.user.id,
        );

        const guildConfig =
            await GamerBotAPIInstance.models.getGuildData(
                interaction.guildId as string,
            );
        if (!guildConfig.ticketData.archivedTicketCategoryId) {
            modalSubmit.reply(
                "Det gick inte att arkivera ticketen eftersom att guild config värdet `archivedTicketParent` inte är definierat! Medlemmen noterades dock ändå.",
            );
            return;
        }

        await modalSubmit.reply(`Arkiverar kanalen om 5 sekunder...`);
        setTimeout(async () => {
            await (interaction.channel as GuildChannel).setParent(
                guildConfig.ticketData.archivedTicketCategoryId,
            );
        }, 5000);
    }

    async getModal() {
        return createModal("Add note", "noteadd", {label:"Add note",placeholder:"note...",style:TextInputStyle.Paragraph,textId:"noteid", requierd:true});
    }
}
