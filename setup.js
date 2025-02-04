import fs from "fs";

fs.writeFile(".env", "TOKEN=\nGAMERBOT_API_TOKEN=\nCONFIG_ID=\n", () => {
    console.log("File created");
});
