import { improveConsoleOutput } from "~/utils/utils";
import * as Scenarios from "./scenarios";

export async function main() {
    try {
        improveConsoleOutput();
        console.log("Tests running...");
        Object.keys(Scenarios);
    } catch (error) {
        console.trace(error);
    }
}

main();
