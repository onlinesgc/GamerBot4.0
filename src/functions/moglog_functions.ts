import { ModLog } from "../classes/modlog";

export function modLogToObject(modlog: ModLog) {
    return {
        type: modlog.type,
        userId: modlog.userId,
        userName: modlog.userName,
        Reason: modlog.Reason,
        length: modlog.length,
        date: modlog.date,
        authorId: modlog.authorId,
    };
}

//eslint-disable-next-line
export function objectToModLog(obj: any){
    return new ModLog(
        obj.type,
        obj.userId,
        obj.userName,
        obj.Reason,
        obj.length,
        (Number.isNaN(parseInt(obj.date))) ? obj.date : new Date(parseInt(obj.date)).toLocaleDateString(),
        obj.authorId);
}
