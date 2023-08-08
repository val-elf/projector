interface IConfig {
	dbUser?: string;
	dbPassword?: string;
	database: string;
	dbHost: string;
}
export const localConfig: IConfig= {
	// dbUser: 'svetocher', // localuser
	// dbUser: 'projector',
	// dbPassword: 'Cal10str0',
	database: 'projector-test',
	dbHost: 'localhost',
    // transcoder: 'http://54.202.134.249:7001/'
    // transcoder: 'http://wnut.com.ua:7001/'
};