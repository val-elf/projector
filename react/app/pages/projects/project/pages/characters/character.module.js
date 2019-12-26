import { CharacterPage } from "./character-page.component";
// import { store } from "~/index";
import { CharactersService } from "~/api/models/character.model";

const routes = [
	{
		name: 'character',
		description: 'CHARACTER',
		url: '/:characterId',
		component: CharacterPage,
		resolve: [
			{
				token: 'character',
				deps: ['project', '$transition$'],
				resolveFn: (project, trans) => {
					const prms = trans.params();
					return CharactersService.getItem(prms.characterId, true, project);
				}
			},
		]
	}
];

export const CharacterModule = {
	routes,
};