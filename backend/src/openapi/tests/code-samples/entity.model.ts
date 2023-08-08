// @OA:schema
// type: string
export type TObject = string;

// @OA:schema
export interface ISomeExampleWithCombine {
    // @OA:property
    someProperty: string | number | boolean | TObject;

    // @OA:property
    exif?: { [key: string]: string | number | boolean };

    // @OA:property
    barbara: number[];
}
