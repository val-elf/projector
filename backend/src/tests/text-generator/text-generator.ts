import { finalPunctuations, punctuations } from './data';
import { ELetterType } from './model';
import { getRandomItem, getRandomOfNormalized, normalyzedProbabilities } from './utils';

export class TextGenerator {

	private vowels = ['a','e','i','o','u','y'];
	private consonants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'];

	private decideToSwitchLetterType(result: string, currentLetterType: ELetterType) {
		const decideToLeaveAsIs = () => {
			if(result.length < 2) {
				return false;
			}

			const secondLastLetter = result[result.length - 2];
			const arr = this[currentLetterType];
			if (arr.includes(secondLastLetter)) {
				if (result.length > 2) {
					const thirdLastLetter = result[result.length - 3];
					if (arr.includes(thirdLastLetter)) {
						return Math.random() > 0.99;
					}
				}
				return Math.random() > 0.9;
			}
			return Math.random() > 0.7;
		}
		if (!decideToLeaveAsIs()) {
			return (currentLetterType === ELetterType.Vowel) ? ELetterType.Consonant : ELetterType.Vowel;
		}
		return currentLetterType;
	}

	public genName(minLength: number = 3, maxLength?: number, capitalize: boolean = false) {
		minLength = minLength ?? 3;
		maxLength = maxLength ?? minLength + 10;

		const length = Math.round(Math.random() * (maxLength - minLength)) + minLength;
		let res = '';
		let letterType = [ELetterType.Vowel, ELetterType.Consonant][Math.round(Math.random())];

		for(let i = 0; i < length; i ++) {
			letterType = this.decideToSwitchLetterType(res, letterType);
			const lastLetter = res[res.length - 1];
			let genLetter = getRandomOfNormalized(normalyzedProbabilities[letterType]);
			while (lastLetter === genLetter) {
				const leaveTheSame = Math.random() > 0.8;
				if (leaveTheSame) {
					break;
				}
				genLetter = getRandomOfNormalized(normalyzedProbabilities[letterType]);
			}
			res += genLetter;
		}
		if (capitalize) {
			res = res[0].toUpperCase() + res.substring(1);
		}
		return res;
	}

	public getAtoms(minWords: number, maxWords: number, maxLength: number, capitalize: boolean) {
		const atoms = [];
		var count = Math.round(Math.random() * (maxWords - minWords)) + minWords, res = [];
		for(let i = 0; i < count; i++) {
			atoms.push(this.genName(3, maxLength, capitalize));
		}
		return atoms;
	}

	public getEntities(minWords: number, maxWords: number, maxLength: number, capitalize: boolean) {
		return this.getAtoms(minWords, maxWords, maxLength, capitalize).join(' ');
	}

	public genPhrase(minWords: number, maxWords: number, maxLength: number, capitalizeFirst: boolean) {
		minWords = minWords ?? 1;
		maxWords = maxWords ?? 1;
		var rwords = Math.round(Math.random() * (maxWords - minWords)) + minWords, res = [];
		for(var i = 0; i< rwords; i++) {
			res.push(this.genName(3, maxLength, (i === 0) && capitalizeFirst));
		}
		return res.join(' ');
	}

	public getSentence() {
		const sentenceParts = [];
		for(let i = 0; i < Math.round(Math.random() * 4) + 1; i++) {
			sentenceParts.push(this.genPhrase(3, 10, 14, i === 0));
		}
		const sentence = sentenceParts.reduce((acc, cur, index) =>
			acc + (index > 0 ? getRandomItem(punctuations) + ' ': '') + cur,
			''
		) + getRandomItem(finalPunctuations);
		return sentence;
	}

	public getText(sentences: number = 10) {
		const textParts = [];
		for(let i = 0; i < sentences; i++) {
			textParts.push(this.getSentence());
		}
		return textParts.join('\n');
	}
}