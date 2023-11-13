"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCathegoriesToCategories = void 0;
const mg = require("mongoose");
const migrateCathegoriesToCategories = async () => {
    const cathmodel = mg.model('cathegories', new mg.Schema({}, { strict: false }), 'cathegories');
    const catmodel = mg.model('categories', new mg.Schema({}, { strict: false }), 'categories');
    const dbObjects = mg.model('dbobjects', new mg.Schema({}, { strict: false }), 'dbobjects');
    const items = (await cathmodel.find({})).map((i) => i._doc);
    catmodel.insertMany(items);
    dbObjects.updateMany({ type: 'cathegories' }, { type: 'categories' });
};
exports.migrateCathegoriesToCategories = migrateCathegoriesToCategories;
//# sourceMappingURL=migrate-cath-to-cat.js.map