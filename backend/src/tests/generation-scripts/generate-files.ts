import { IInitFile } from '~/backend/entities/models';
import { IGenerationScript } from '../model';

export class GenerateFiles implements IGenerationScript {
    public async *generate() {
    }

    private async createFileInstance(): Promise<IInitFile> {
        return Promise.resolve(
            {
            name: 'test',
            file: 'test',
            description: 'test',
            type: 'test',
            size: 0,
        });
    }
}