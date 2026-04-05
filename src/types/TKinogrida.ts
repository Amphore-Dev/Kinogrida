import { BaseShape } from "@/classes/BaseShape.js";

export type TKinogridaEventMap = {
    cellClick: (x: number, y: number, isValid: boolean) => void;
    moveStart: (
        shape: BaseShape,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
    ) => void;
    move: (shape: BaseShape, x: number, y: number) => void;
    moveEnd: (shape: BaseShape, x: number, y: number) => void;
};

export type TDebugOptions = {
    showGrid: boolean;
    showStats: boolean;
    showLockedCells: boolean;
    showPath: boolean;
    showPosition: boolean;
};

export type TEngineOptions = {
    canvas?: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    nbrColumns: number;
    nbrRows: number;
    cellSize: number;
    gridMargin: number;
    lineWidth: number;
    showMouseHighlight?: boolean;
    speed: number;
    debug: boolean | TDebugOptions;
};
