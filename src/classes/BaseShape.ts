import {
    TGrid,
    TGridConfig,
    TLockedCell,
    TShapeConfig,
} from "@/types/TGrid.js";
import { random } from "@/utils/UMath.js";

export class BaseShape {
    protected grid: TGrid;
    protected x: number = 0;
    protected y: number = 0;
    protected speed: number = 0.005;

    protected lastMoveTime: number = Date.now(); // Randomize initial move debounce time
    protected moveDuration: number = 1000; // Duration of the move in milliseconds
    protected minBounceTime: number = 5; // Minimum time in seconds before the shape can move again
    protected maxBounceTime: number = 10; // Maximum time in seconds before the shape can move again
    protected moveDebounce: number = 1000 * random(0, this.maxBounceTime); // Minimum time between moves in milliseconds

    protected canMove: boolean = true;
    protected isMoving: boolean = false;
    protected tailX: number = 0;
    protected tailY: number = 0;
    protected originalX: number = 0;
    protected originalY: number = 0;
    protected targetX: number = 0;
    protected targetY: number = 0;
    protected hasReachedTarget: boolean = false;

    protected color: string = "red";

    protected lockedCells: TLockedCell[] = [];

    constructor(
        grid: TGrid,
        x: number = 0,
        y: number = 0,
        options: TShapeConfig,
    ) {
        this.grid = grid;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.color = options.color;
        this.tailX = x;
        this.tailY = y;
        this.originalX = x;
        this.originalY = y;
    }

    public moveTo(grid: TGrid, x: number, y: number) {
        if (
            this.isMoving ||
            Date.now() - this.lastMoveTime < this.moveDebounce
        ) {
            return;
        }
        const lockedCells = this.genLockPath(grid, x, y);
        if (!this.lockGridCells(grid, lockedCells, false)) {
            return;
        }

        this.lockGridCells(grid, lockedCells, true);

        this.targetX = x;
        this.targetY = y;
        this.tailX = this.x;
        this.tailY = this.y;
        this.originalX = this.x;
        this.originalY = this.y;
        this.isMoving = true;
        this.lastMoveTime = Date.now();
    }

    public genLockPath(
        grid: TGrid,
        targetX: number,
        targetY: number,
    ): TLockedCell[] {
        // Calculer la trajectoire entre la position actuelle et la position cible
        const startX = Math.round(this.x);
        const startY = Math.round(this.y);
        const endX = targetX;
        const endY = targetY;

        return this.getLineCells(startX, startY, endX, endY);
    }

    public lockGridCells(
        grid: TGrid,
        cells: TLockedCell[],
        applyLocks: boolean = true,
    ): boolean {
        // Calculer la trajectoire entre la position actuelle et la position cible
        // grid[startY][startX] = "locked"; // Lock the starting cell
        // Marquer toutes les cellules sur la trajectoire comme "locked"
        for (const { x, y } of cells) {
            if (grid[y][x] !== null || grid[y][x] === "locked") {
                if (y !== this.y || x !== this.x) {
                    return false;
                }
            }
            if (
                y >= 0 &&
                y < grid.length &&
                x >= 0 &&
                x < grid[y].length &&
                grid[y][x] === null
            ) {
                if (applyLocks) {
                    grid[y][x] = "locked";
                    this.lockedCells.push({ x, y });
                }
            }
        }
        return true;
    }

    protected getLineCells(
        x0: number,
        y0: number,
        x1: number,
        y1: number,
    ): TLockedCell[] {
        const cells: TLockedCell[] = [];

        return cells;
    }

    public update(
        grid: TGrid,
        gridConfig: TGridConfig,
        context: CanvasRenderingContext2D,
    ): void {
        this.grid = grid; // Update the grid reference in case it has changed
        if (this.isMoving) {
            this.updatePosition(grid);
        } else {
            this.calculateNewTarget(grid, gridConfig);
        }
        this.draw(context, gridConfig);
    }

    protected calculateNewTarget(grid: TGrid, gridConfig: TGridConfig): void {}

    protected updatePosition(grid: TGrid): void {}

    protected onMoveComplete(grid: TGrid): void {
        this.isMoving = false;
        this.lastMoveTime = Date.now();
        this.moveDebounce =
            1000 * random(this.minBounceTime, this.maxBounceTime); // Randomize next move debounce time
        this.unlockGridCells(grid);
        this.x = this.targetX;
        this.y = this.targetY;
        grid[this.y][this.x] = this; // Place the item in the grid at its new position
        grid[this.originalY][this.originalX] = null; // Clear the original position in the grid
        this.hasReachedTarget = false;
    }

    public unlockGridCells(grid: TGrid): void {
        for (const { x, y } of this.lockedCells) {
            if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) {
                grid[y][x] = null;
            }
        }
        this.lockedCells = [];
    }

    public draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig) {}

    public drawLockedCells(
        context: CanvasRenderingContext2D,
        gridConfig: TGridConfig,
    ) {
        const { cellSize, offsetX, offsetY } = gridConfig;
        context.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red with transparency
        this.lockedCells.forEach(({ x, y }) => {
            const pixelX = x * cellSize + offsetX;
            const pixelY = y * cellSize + offsetY;
            context.fillRect(pixelX, pixelY, cellSize, cellSize);
        });
    }
}
