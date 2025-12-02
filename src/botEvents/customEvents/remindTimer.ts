import { Client } from "discord.js";
import { CustomEvent } from "../../classes/customEvent.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";

/**
 * Custom event to remind users, user add reminder with the command remind
 */
export default class remindTimer implements CustomEvent {
    run_event(client: GamerbotClient): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.reminderList.forEach(async (reminder: any) => {
            if (reminder.remindTimestamp > Date.now()) return;

            client.users.fetch(reminder.userId).then((user) => {
                user.send(`Reminder: ${reminder.message}`);
            });

            client.reminderList.splice(
                client.reminderList.indexOf(reminder),
                1,
            );
            
            const userData =
                await GamerBotAPIInstance.models.getUserData(
                    reminder.userId,
                );

            const index = userData.reminders.findIndex(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (rem: any) =>
                    rem.message == reminder.message &&
                    rem.remindTimestamp == reminder.remindTimestamp,
            );
            if (index != -1) {
                userData.reminders.splice(index, 1);
                userData.save();
            }
        });
    }
    emitor(client: Client): void {
        setInterval(() => {
            this.run_event(client as GamerbotClient);
        }, 1000 * 5);
    }
}
