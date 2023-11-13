import { core } from '../core';
import { IGenerationScript } from '../model';
import { utils } from '../utils';

export class GenerateUsers implements IGenerationScript {
    constructor() {}

    private async loginAsAdmin() {
        const authData = await core.post('/login', {
            login: 'admin',
            password: 'admin'
        });
        core.setAuthToken(authData.sessionToken);
    }

    private async generateTestUser() {
        // generate test user
        const firstName = utils.textGenerator.genName(3, 5, true);
        const lastName = utils.textGenerator.genName(4, 7, true);
        const createdUser = await core.post('/users', { login: 'test', password: 'test' }, {});
        await core.put(`/users/${createdUser._id}`, { ...createdUser, firstName, lastName });

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