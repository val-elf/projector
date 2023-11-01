export type QualifiedInterface<T> = {
    room: string;
    proj: T[];
    methodName(value: string): Promise<T>;
}
// this is another part of the test
| {
    external: boolean;
} | { internal: boolean };

export const b: string = '3';

export type TInitialEntity<T> = Omit<T, '_coretype' | '_hash' | '_id'>;

export enum ETripTrop {
    TRIP = 'trip',
    TROP = 'trop',
}

export type TUnion = string | TObjectId;

