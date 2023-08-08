import QueryString from 'qs';
import { Service } from '../../network/service';
import { DbBridge } from './db-bridge';
import { ICommonEntity } from './models';

export interface IPreselectResult {
	$match?: any,
	$aggregate?: any[],
	$projection?: any,
}

export interface IEntityController<T extends ICommonEntity> {
	model: DbBridge<T>;
	registryModel(): void;
	preCreate?(item: T, ...options: any[]): Promise<T>;
	preUpdate?(item: T, ...options: any[]): Promise<T>;
	preSelect?(...options: any[]): Promise<IPreselectResult>;
	processMetadata(metadata: QueryString.ParsedQs);
	prepareArguments(args: any[]): any[];
}

export abstract class EntityControllerBase implements IEntityController<any> {
    public abstract get model(): DbBridge<any>;
	public abstract registryModel();
	public static modelName: string;
	public abstract processMetadata(metadata: QueryString.ParsedQs);
	public abstract prepareArguments(args: any[]): any[];

	constructor(public app: Service) { }
}

