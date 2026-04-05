import { TGridConfig } from "@/types/TGrid.js";

export const CDEFAULT_GRID_CONFIG: TGridConfig = {
    nbrColumns: 10,
    nbrRows: 10,
    cellSize: 1,
    gridMargin: 50,
    offsetX: 0,
    offsetY: 0,
    width: 0,
    height: 0,
    lineWidth: 1,
    speed: 4000,
    debug: false,
    context: null as unknown as CanvasRenderingContext2D,
    colors: [],
};
