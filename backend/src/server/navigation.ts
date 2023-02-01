import { IUser } from '~/backend/entities/models/db.models';
import { IRouter } from '../backend/core/models';
import { Service } from '../network/service';
import { navigation } from "../_navigation/navigation";

const navData = navigation();

export class NavigationsRouter implements IRouter {
	model;
	private app: Service;
	user: IUser;

	configure(app: Service){
		this.app = app;
		app.get('/navigation', this.getNavigation);
	}


	getNavigation = async () => {
		console.warn("[API] Get navigation", navData);
		try{
			const dataRes = [];
			this.user.roles && this.user.roles.forEach(role => {
				if(navData[role.name])
					dataRes.push.apply(dataRes, navData[role.name].pages);
			});
			return dataRes;
		} catch(error) {
			this.app.response.setError(error);
		};
	}
}