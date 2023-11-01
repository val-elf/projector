import QueryString from 'qs';
import { Service } from '../../network/service';
import { DbBridge } from './db-bridge';
import { ICommonEntity } from './models';

export interface IPreselectResult {
	$match?: any,
	$aggregate?: any[],
	$projection?: any,
}

export interface IEntityController<T extends ICommonEntity, C extends ICommonEntity> {
	model: DbBridge<T, C>;
	registryModel(): void;
	preCreate?(item: T, ...options: unknown[]): Promise<T>;
	preUpdate?(item: T, ...options: unknown[]): Promise<T>;
	preSelect?(...options: unknown[]): Promise<IPreselectResult>;
	processMetadata(metadata: QueryString.ParsedQs);
	prepareArguments(args: unknown[]): unknown[];
}

export abstract class EntityControllerBase<T, C> implements IEntityController<T, C> {
    public abstract get model(): DbBridge<T, C>;
	public abstract registryModel();
	public static modelName: string;
	public abstract processMetadata(metadata: QueryString.ParsedQs);
	public abstract prepareArguments(args: unknown[]): unknown[];

	constructor(public app: Service) { }
}

