export class ModLog {
    type: string;
    userId: string;
    userName: string;
    Reason: string;
    length: string | null;
    //eslint-disable-next-line
    date: any;
    authorId: string;
    constructor(
        type: string,
        userId: string,
        userName: string,
        Reason: string,
        length: string | null,
        date: number,
        authorId: string,
    ) {
        this.type = type;
        this.userId = userId;
        this.userName = userName;
        this.Reason = Reason;
        this.length = length;
        this.date = date;
        this.authorId = authorId;
    }

    getFormattedUserName(){
        return `<@${this.userId}>(${(this.userName) ? "" : this.userName})`
    }

    getEmbedField(mod_log_number: number){
        const obj = {
            name: `Mod log ${mod_log_number + 1}`,
            value: `Log Typ: ${this.type}\nAnvändare: ${this.getFormattedUserName()})\nAnledning: ${this.Reason}\nTid: ${this.date}\n Moderator: <@${this.authorId}>`
        }
        if(this.length) obj.value += `\nLängd: ${this.length}`;
        return obj;
    }
}
