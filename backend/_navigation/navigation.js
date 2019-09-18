var app;

module.exports = function(){
	return {
		"superadmin": {
			"pages": 
				[
					{
						"title": "users",
						"state": "app.usersAdmin"
					}
				]
		},
		"single": {
			pages: [
				{
					title: 'Доска',
					state: 'app.dashboard'
				},
				{
					title: 'Проекты',
					state: 'app.projects'
				},
				{
					title: 'Задачи',
					state: 'app.tasks'
				},
				{
					title: 'Настройки',
					state: 'app.settings'
				},
				{
					title: 'Пользователи',
					state: 'app.users'
				}
			]
		}
	}
};