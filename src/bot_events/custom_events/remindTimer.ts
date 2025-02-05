import { Client } from "discord.js";
import { CustomEvent } from "../../classes/custom_event.js";
import { GamerBotAPIInstance, GamerbotClient } from "../../index.js";

/**
 * Custom event to remind users, user add reminder with the command remind
 */
export default class remindTimer implements CustomEvent {
    run_event(client: GamerbotClient): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.reminder_list.forEach(async (reminder: any) => {
            if (reminder.remindTimestamp > Date.now()) return;

            client.users.fetch(reminder.user_id).then((user) => {
                user.send(`Reminder: ${reminder.message}`);
            });

            client.reminder_list.splice(
                client.reminder_list.indexOf(reminder),
                1,
            );
            
            const user_profile =
                await GamerBotAPIInstance.models.get_profile_data(
                    reminder.user_id,
                );

            const index = user_profile.reminders.findIndex(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (rem: any) =>
                    rem.message == reminder.message &&
                    rem.remindTimestamp == reminder.remindTimestamp,
            );
            if (index != -1) {
                user_profile.reminders.splice(index, 1);
                user_profile.save();
            }
        });
    }
    emitor(client: Client): void {
        setInterval(() => {
            this.run_event(client as GamerbotClient);
        }, 1000 * 5);
    }
}
