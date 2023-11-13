import { probabilities } from './data';

export function getNormalizedProbabilities(item: any) {
	const keys = Object.keys(item);
	const sum = keys.reduce((acc, key) => acc + item[key], 0);
	return keys.reduce((acc, key) => ({
		...acc,
		[key]: item[key] / sum
	}), {});
}

export const normalyzedProbabilities = {
	vowels: getNormalizedProbabilities(probabilities.vowels),
	consonants: getNormalizedProbabilities(probabilities.consonants)
};

export const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export const getRandomOfNormalized = (item: any) => {
	const keys = Object.keys(item);
	const random = Math.random();
	let acc = 0;
	for (let i = 0; i < keys.length; i++) {
		acc += item[keys[i]];
		if (acc > random) {
			return keys[i];
		}
	}
}

