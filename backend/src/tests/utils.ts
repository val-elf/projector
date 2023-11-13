import { TextGenerator } from './text-generator';
import { readFileSync, readdirSync } from 'fs';

const IMAGE_PATH = './src/tests/images';

class Utils {
	textGenerator = new TextGenerator();

	public async loadImage() {
        const dircontent = readdirSync(IMAGE_PATH);
        const imageIndex = Math.round(Math.random() * (dircontent.length - 1));
        const imageFileName = dircontent[imageIndex];
        const image = readFileSync(`${IMAGE_PATH}/${imageFileName}`);
        const imageCode = image.toString('base64');
        return imageCode;
    }

    public getRandomItem<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    public getRandomDate(minDate: Date, maxDate: Date) {
        const min = minDate.getTime();
        const max = maxDate.getTime();
        const rand = min + Math.random() * (max - min);
        return new Date(rand);
    }
}

export const utils = new Utils();