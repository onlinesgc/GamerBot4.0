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
/*
export function objectToModLog(obj: any){
    return new MogLog(obj.type,obj.userId,obj.userName,obj.Reason,obj.length,obj.date,obj.authorId);
}
*/
