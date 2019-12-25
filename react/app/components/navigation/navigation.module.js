import { Dashboard } from '~/pages/dashboard/dashboard.component';
import { ProjectsModule } from "~/pages/projects/projects.module";
import { Layout } from "~/pages/layout.component";

export default {
	_map: [
		{
			name: "app",
			hidden: true,
			abstract: true,
			component: Layout,
		},
		{
			name: "app.dashboard",
			description: "DASHBOARD",
			url: "/",
			component: Dashboard
		},
		{
			name: "app.projects",
			description: "PROJECTS",
			url: '/projects',
			component: ProjectsModule.Projects,
			children: ProjectsModule.Projects.routes,
		},
		{
			name: "app.tasks",
			description: "TASKS",
			url: "/tasks",
			component: Dashboard
		},
		{
			name: "app.settings",
			description: "SETTINGS",
			url: "/settings",
			component: Dashboard
		},
		{
			name: "app.users",
			description: "USERS",
			url: "/users",
			component: Dashboard
		}
	],
	apply: function(serverNavigation){
		var res = this._map.filter( origin => {
			return origin.name === 'app' || !!serverNavigation.find( item => item.state === origin.name);
		});
		res.flat = this._flat;
		return res;
	},
	_flat: function(){ //works with prepared in apply() array
		const _flat = (map, parent) => {
			return map.reduce( (ov, item, index) => {
				var _item = {
					name: (parent ? parent.name + '.' : '') + item.name,
					abstract: item.abstract,
					description: item.description,
					url: item.url,
					data: item.data,
					dynamic: item.dynamic,
					params: item.params,
					hidden: item.hidden,
					component: item.component,
					resolve: item.resolve,
					onExit: item.onExit
				}
				ov.push(_item);
				if(item.children && item.children.length) ov = ov.concat( _flat( item.children, _item ));
				return ov;
			}, []);
		}

		return _flat(this);
	}
}
