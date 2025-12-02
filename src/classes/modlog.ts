export class ModLog {
    type: string;
    userId: string;
    username: string;
    reason: string;
    length: string | null;
    //eslint-disable-next-line
    timestamp: any;
    authorId: string;
    constructor(
        type: string,
        userId: string,
        username: string,
        reason: string,
        length: string | null,
        timestamp: number,
        authorId: string,
    ) {
        this.type = type;
        this.userId = userId;
        this.username = username;
        this.reason = reason;
        this.length = length;
        this.timestamp = timestamp;
        this.authorId = authorId;
    }

    getFormattedUserName() {
        return `<@${this.userId}>${this.username || this.username == null ? "" : `(${this.username})`}`;
    }

    getEmbedField(modLogNumber: number) {
        const obj = {
            name: `Mod log ${modLogNumber + 1}`,
            value: `Log Typ: ${this.type}\nAnvändare: ${this.getFormattedUserName()}\nAnledning: ${this.reason}\nTid: ${new Date(this.timestamp).toDateString()}\n Moderator: <@${this.authorId}>`,
        };
        if (this.length) obj.value += `\nLängd: ${this.length}`;
        return obj;
    }
}
