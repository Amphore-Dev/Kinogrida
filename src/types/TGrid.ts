import { BaseShape } from "@/classes/BaseShape.js";

export type TPosition = {
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
    debug: boolean;
    context: CanvasRenderingContext2D;
    colors: string[];
};

export type TShapeConfig = {
    color: string;
    radiusPercent?: number;
    clockwise?: boolean; // Sens de rotation pour les formes animées
    rotationAmount?: number; // Amplitude de rotation : 0.25 (quart), 0.5 (demi), 0.75 (trois quarts), 1.0 (complet)
};
