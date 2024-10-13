import { ModLog } from '../classes/modlog'

export function modLogToObject(modlog: ModLog) {
    return {
        type: modlog.type,
        userID: modlog.userID,
        userName: modlog.userName,
        Reason: modlog.Reason,
        length: modlog.length,
        date: modlog.date,
        authorID: modlog.authorID,
    }
}

//eslint-disable-next-line
export function objectToModLog(obj: any) {
    return new ModLog(
        obj.type,
        obj.userID,
        obj.userName,
        obj.Reason,
        obj.length,
        Number.isNaN(parseInt(obj.date))
            ? obj.date
            : new Date(parseInt(obj.date)).toLocaleDateString(),
        obj.authorID,
    )
}
