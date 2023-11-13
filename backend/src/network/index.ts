import { Express } from "express";
export { Request } from "./request";
export { Response } from "./response";
import { Service, service } from "./service";
export { Route, Router, EMethod } from "./route.decorator";
export {
	Service, service
};

import { config } from "../config";
import expressContext from 'express-request-context';
import session from "express-session";


export function configureApp(app: Express, isDev: boolean = false, useSession: boolean = false, database?: string, port?: number) {
	if (useSession) {
		app.use(session({
			secret: 'projector periskopen',
			resave: false,
			saveUninitialized: false,
			cookie: { secure: !isDev }
		}));
	}
	app.use(expressContext());
	service.init(app, {
		...config,
		...(database ? { database } : {})
	});
	app.listen(port ?? config.port);
}
