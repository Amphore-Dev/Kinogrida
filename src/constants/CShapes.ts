import { ArcShape } from "@/classes/ArcShape.js";
import { SquareShape } from "@/classes/SquareShape.js";

export const SHAPES_TYPES = {
    arc: ArcShape,
    square: SquareShape,
} as const;
