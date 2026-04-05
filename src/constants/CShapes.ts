import { ArcShape } from "@/classes/ArcShape.js";
import { BaseShape } from "@/classes/BaseShape.js";
import { SquareShape } from "@/classes/SquareShape.js";

export const SHAPES_TYPES: Record<string, typeof BaseShape> = {
    arc: ArcShape,
    square: SquareShape,
};

export type TShapeType = keyof typeof SHAPES_TYPES;
