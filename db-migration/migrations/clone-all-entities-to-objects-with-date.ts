//import * as db from "mongodb";
import * as mg from "mongoose";

const collections = [
    // 'artifacts',
    'categories',
    // 'characters',
    // 'documents',
    // 'files',
    // 'locations',
    // 'permissions',
    // 'projects',
    // 'roles',
    // 'sessions',
    // 'timelines',
    // 'timespots',
    // 'users',
];

function prepareSource(source: any) {
    const result: any = { $set: { _id: source._id }, $unset: {} };
    if (source._create) result.$set._create = source._create
    else result.$unset._create = "";

    if (source._update) result.$set._update = source._update
    else result.$unset._update = "";

    if (source._deleted) {
        result.$set._deleted = source._deleted
        result.$set.status = "deleted";
    }
    else result.$unset._deleted = "";

    if (Object.keys(result.$unset).length === 0) delete result.$unset;

    return result;
}

export async function runUpdateDbObjects() {
    //const dbCollections = await db
    const mgObjects = mg.model('dbobjects', new mg.Schema({}, { strict: false }), 'dbobjects');

    const dbObjects = (await mgObjects.find({})).map((i: any) => i._doc);
    await Promise.all(collections.map(async (collection) => {

        const model = mg.model(collection, new mg.Schema({}, { strict: false }), collection);
        if(model) {
            const docs = (await model.find({})).map((i: any) => i._doc);
            const inserted = [];
            const updated = [];
            docs.forEach(doc => {
                const dbObject = dbObjects.find(dbObject => dbObject.objectId.equals(doc._id));
                if (!dbObject) {
                    const id = doc._id;
                    inserted.push({
                        _id: id,
                        type: collection,
                        status: 'normal',
                        objectId: id,
                        _create: doc._create,
                        _update: doc._update,
                        _deleted: doc._deleted,
                    });
                } else {
                    const prepared = prepareSource(doc);
                    console.log('Prepared', prepared);
                    updated.push(prepared);
                }
            });
            await mgObjects.insertMany(inserted, {
                ordered: false,
            });
            await Promise.all(updated.map(async u => {
                const res = await mgObjects.db.collections['dbobjects'].updateOne({ _id: u.$set._id }, u );
            }));
        }
    }));
}

export const cleanObjectsFromCreateUpdate = async () => {
    await Promise.all(collections.map(async (collection) => {
        const model = mg.model(collection, new mg.Schema({}, { strict: false }), collection);
        if(model) {
            // const docs = (await model.find({})).map((i: any) => i._doc);
            console.log('Cleanup for ', collection);
            model.db.collections[collection].updateMany({}, { $unset: { _create: "", _update: "" } });
        }
    }));
    console.log('Cleanup is done');
}

