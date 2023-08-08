import { core } from '../core';
import { IGenerationScript } from '../model';

export class GenerateUsers implements IGenerationScript {
    constructor() {}

    private async loginAsAdmin() {
        const authData = await core.post('/login', {
            login: 'admin',
            password: 'admin'
        });
        console.log('ADMIN TOKENT', authData);
        core.setAuthToken(authData.sessionToken);
    }

    private async generateTestUser() {
        // generate test user
        await core.post('/users', { login: 'test', password: 'test' }, {});

        //auth as test
        await core.post('/logout', {});
    }

    public async *generate() {
        // authorize as admin
        await this.loginAsAdmin();
        await this.generateTestUser();

        yield true;
    }
}

export class AuthenticateUser implements IGenerationScript {
    constructor() {}

    public async *generate() {
        const authData = await core.post('/login', {
            login: 'test',
            password: 'test'
        });
        core.setAuthToken(authData.sessionToken);
        yield true;
    }
}