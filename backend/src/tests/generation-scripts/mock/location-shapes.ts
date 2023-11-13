import "json5/lib/register";
import locations from './location-shapes.json';
import { ICoord2D } from '~/backend/entities/models';
export const locationShapes = locations;

export function getRandomShape(): ICoord2D[] {
    return locationShapes[Math.floor(Math.random() * locationShapes.length)];
}