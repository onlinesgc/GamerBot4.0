export function get_emojis(num:number){
    const string_num = num.toString();
    let emojis = "";
    for(let i = 0; i < string_num.length; i++){
        emojis += get_emoji(string_num[i])+ "  ";
    }
    return emojis;
}

export function get_emoji(num_string:string) : string{
    switch (num_string) {
        case "0":
            return "✊";
        case "1":
            return "👆";
        case "2":
            return "✌️";
        case "3":
            return "🤟";
        case "4":
            return "✌️+✌️";
        case "5":
            return "🖐";
        case "6":
            return "🖐+" + get_emoji("1");
        case "7":
            return "🖐+" + get_emoji("2");
        case "8":
            return "🖐+" + get_emoji("3");
        case "9":
            return "🖐+" + get_emoji("4");
    }
    return "";
}