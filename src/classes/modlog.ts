export class MogLog {
    type: string;
    userId: string;
    userName: string;
    Reason: string;
    length: string;
    date: number;
    authorId: string;
    constructor(
        type: string,
        userId: string,
        userName: string,
        Reason: string,
        length: string,
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
}
