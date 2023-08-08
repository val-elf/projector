// @OA:schema
// description: Error message
interface IErrorMessage {
    // @OA:property
    // description: Error message
    message: string;

    // @OA:property
    // description: Error backtrace
    backtrace: string[];
}

// @OA:schema
// description: Error
export interface IError {
    // @OA:property
    // description: Error message
    _error: IErrorMessage;
}