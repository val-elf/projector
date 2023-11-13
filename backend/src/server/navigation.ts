import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { navigation } from '../_navigation/navigation';
import { EMethod, Route, Router } from '~/network';

const navData = navigation();
@Router()
export class NavigationsRouter implements IRouter {
	model;
	private app: Service;
	// user: IUser;

	configure(app: Service){
		this.app = app;
		app.get('/navigation', this.getNavigation);
	}

	@Route(EMethod.GET, '/navigation')
	getNavigation(): any[] {
		console.warn('[API] Get navigation', navData);
		try{
			const dataRes = [];
			const roles = [{ name: 'superadmin' } , { name: 'single' }];
			roles && roles.forEach(role => {
				if(navData[role.name])
					dataRes.push.apply(dataRes, navData[role.name].pages);
			});
			return dataRes;
		} catch(error) {
			this.app.response.setError(error);
		};
	}
}