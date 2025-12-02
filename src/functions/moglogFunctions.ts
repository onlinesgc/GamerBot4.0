import { ModLog } from "../classes/modlog.js";

export function modLogToObject(modlog: ModLog) {
    return {
        type: modlog.type,
        userId: modlog.userId,
        username: modlog.username,
        reason: modlog.reason,
        length: modlog.length,
        timestamp: modlog.timestamp,
        authorId: modlog.authorId,
    };
}

//eslint-disable-next-line
export function objectToModLog(obj: any) {
    return new ModLog(
        obj.type,
        obj.userId,
        obj.username,
        obj.reason,
        obj.length,
        Number.isNaN(parseInt(obj.timestamp))
            ? obj.timestamp
            : new Date(parseInt(obj.timestamp)).toLocaleDateString(),
        obj.authorId,
    );
}
