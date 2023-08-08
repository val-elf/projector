export interface IGenerationScript {
    generate(): AsyncGenerator<any>;
}