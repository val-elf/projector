// @OA:schema
// description: 2D coordinate
export interface ICoord2D {
    // @OA:property
    // description: X coordinate
    x: number;

    // @OA:property
    // description: Y coordinate
    y: number;
}


// @OA:schema
// description: Array of the 2D coordinates
export type TShape = ICoord2D[];
