import { ICommonEntity, TObjectId } from '../../core/models';

export interface IEntityList<T> {
    data: T[];
    _: {
        total?: number;
        page?: number;
        offset?: number;
        count: number;
        more?: boolean;
    }
}

export interface IEntityAction {
    _dt: string;
    _user: TObjectId;
}

export interface IDbObject extends ICommonEntity {
    type: string;
    status: string;
    objectId: TObjectId;
}

export interface IDbObjectBase extends ICommonEntity {
	_create: IEntityAction;
	_update?: IEntityAction;
	_coretype: string;
    _deleted?: IEntityAction;
	_hash: string;
	status: string;
}

export interface IPreview extends ICommonEntity {
    preview: string;
    type: string;
}

export interface IPreviewed {
    preview: IPreview;
}

export interface IArtifact extends IDbObjectBase, IPreviewed {
	name: string;
    characters: ICharacter[],
    type: string;
    subtype: string;
}

export interface IRole extends IDbObjectBase {
    name: string;
    permissions: string[];
}


export interface IFilterOptions {
    skip?: number;
    total?: number;
    limit?: number;
    page?: number;
}

export interface ICategory extends IDbObjectBase {

}

export interface ICharacter extends IDbObjectBase {
    name: string;
    role: string;
    description: string;
    preview: IPreview;
}

export interface IDocument extends IDbObjectBase {
    title: string;
    metadata?: {
        size: number;
        type: string;
        lastModified: number;
    },
    _file: TObjectId;
    _owner: TObjectId;
    file?: IFile;
}

export interface IFile extends IDbObjectBase, IPreviewed {
    name: string;
    file: string;
    type: string;
    _owner: TObjectId; // points to the Document object owner
    _transcode?: TObjectId;
    size: number;
    exif?: { [key: string]: string | number | boolean };
    _status?: { status: string };
    transcoder: string;
}

export interface ILocation extends IDbObjectBase {

}

export interface IProject extends IDbObjectBase {

}

export interface ITimeline extends IDbObjectBase {
    name: string;
    startDate: string;
    endDate: string;
    timespots: ITimespot[];
    _project: TObjectId;
    locked?: boolean;
}

export interface ITimespot extends IDbObjectBase {
    startDate: string;
    startOffsetX: number;
    endDate: string;
    endOffsetX: number;
    offsetX: number;
    title: string;
    locked?: boolean;
    _timeline: TObjectId;
}

export interface IUser extends IDbObjectBase {
    login: string;
    email: string;
    password: string;
    roles: TObjectId[] | IRole[];
}

export interface ISession extends ICommonEntity {
    user: TObjectId;
    expired?: boolean;
}