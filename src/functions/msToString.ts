export function msToString(input:number):string{
    const days = Math.floor(input / (1000 * 60 * 60 * 24));
    const hours = Math.floor((input % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((input % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((input % (1000 * 60)) / 1000);
    let output = "";
    if(days > 0){
        output += days + " dagar, ";
    }
    if(hours > 0){
        output += hours + " timmar, ";
    }
    if(minutes > 0){
        output += minutes + " minuter, ";
    }
    if(seconds > 0){
        output += seconds + " sekunder";
    }
    return output;

}