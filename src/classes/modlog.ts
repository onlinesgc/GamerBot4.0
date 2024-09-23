export class ModLog {
    type: string;
    userID: string;
    userName: string;
    Reason: string;
    length: string | null;
    //eslint-disable-next-line
    date: any;
    authorID: string;
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
        this.userID = userId;
        this.userName = userName;
        this.Reason = Reason;
        this.length = length;
        this.date = date;
        this.authorID = authorId;
    }

    getFormattedUserName(){
        return `<@${this.userID}>${(this.userName || this.userName == null) ? "" : `(${this.userName})`}`
    }

    getEmbedField(mod_log_number: number){
        const obj = {
            name: `Mod log ${mod_log_number + 1}`,
            value: `Log Typ: ${this.type}\nAnvändare: ${this.getFormattedUserName()}\nAnledning: ${this.Reason}\nTid: ${this.date}\n Moderator: <@${this.authorID}>`,
        }
        if(this.length) obj.value += `\nLängd: ${this.length}`;
        return obj;
    }
    
}
