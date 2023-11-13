import * as mg from "mongoose";
import {
    runUpdateDbObjects,
    cleanObjectsFromCreateUpdate
} from './clone-all-entities-to-objects-with-date';
import { migrateCathegoriesToCategories } from './migrate-cath-to-cat';

async function connect() {
    const connection = await mg.connect("mongodb://localhost:27017/projector2", {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    });
    return connection;
}

async function main() {
    const db = await connect();
    // await runUpdateDbObjects();
    await cleanObjectsFromCreateUpdate();
    // await migrateCathegoriesToCategories();
    console.log('-------------- Migration done --------------');
}

(async () => {
    await main();
    console.log('Done');
})();
