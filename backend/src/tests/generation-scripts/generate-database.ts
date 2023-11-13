import { MongoClient } from 'mongodb';
import { IGenerationScript } from '../model';
import md5 from 'md5';

const COLLECTIONS = [
    'acl',
    'artifacts',
    'categories',
    'characters',
    'dbobjects',
    'documents',
    'files',
    'locations',
    'permissions',
    'projector',
    'projects',
    'roles',
    'sessions',
    'timelines',
    'timespots',
    'users',
    'stickers',
    'schedules',
    'tags',
    'vendors',
];

export class DatabaseGenerator implements IGenerationScript {
    private client: MongoClient;

    constructor() {
    }
    private async connect() {
        this.client = await MongoClient.connect('mongodb://localhost:27017/', { });
    }

    private async recreateDatabase() {
        let db = this.client.db('projector-test');
        await db.dropDatabase();
        db = this.client.db('projector-test');
        return db;
    }

    async *generate(): AsyncGenerator<any, any, unknown> {
        await this.connect();
        const db = await this.recreateDatabase();
        const ecollections = await db.collections();
        for await(const collection of COLLECTIONS) {
            await db.createCollection(collection);
        }

        // create system admin user
        const users = db.collection('users');
        await users.insertOne({
            login: 'admin',
            password: md5('admin:admin'),
            email: 'admin@wnut.com.ua'
        });

        yield true;
    }
}