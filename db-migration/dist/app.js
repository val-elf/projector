"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mg = require("mongoose");
const clone_all_entities_to_objects_with_date_1 = require("./clone-all-entities-to-objects-with-date");
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
    await (0, clone_all_entities_to_objects_with_date_1.cleanObjectsFromCreateUpdate)();
    // await migrateCathegoriesToCategories();
    console.log('-------------- Migration done --------------');
}
(async () => {
    await main();
    console.log('Done');
})();
//# sourceMappingURL=app.js.map