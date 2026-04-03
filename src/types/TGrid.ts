import { BaseShape } from "@/classes/BaseShape.js";

export type TLockedCell = {
    x: number;
    y: number;
};

export type TGridCell = BaseShape | "locked" | null;

export type TGrid = TGridCell[][];

export type TGridConfig = {
    nbrColumns: number;
    nbrRows: number;
    cellSize: number;
    gridMargin: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    lineWidth: number;
};

export type TShapeConfig = {
    color: string;
    radiusPercent?: number;
};
