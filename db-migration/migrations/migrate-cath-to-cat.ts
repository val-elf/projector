import * as mg from "mongoose";

export const migrateCathegoriesToCategories = async () => {
    const cathmodel = mg.model('cathegories', new mg.Schema({}, { strict: false }), 'cathegories');
    const catmodel = mg.model('categories', new mg.Schema({}, { strict: false }), 'categories');
    const dbObjects = mg.model('dbobjects', new mg.Schema({}, { strict: false }), 'dbobjects');
    const items = (await cathmodel.find({})).map((i: any) => i._doc);
    catmodel.insertMany(items);
    dbObjects.updateMany({ type: 'cathegories' }, { type: 'categories' });
}