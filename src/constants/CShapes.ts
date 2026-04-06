import { ArcShape } from "@/classes/ArcShape.js";
import { SquareShape } from "@/classes/SquareShape.js";
import { TShapeConstructor } from "@/types/TGrid.js";

export const SHAPES_TYPES: Record<string, TShapeConstructor> = {
    arc: ArcShape,
    square: SquareShape,
};

export type TShapeType = string;
