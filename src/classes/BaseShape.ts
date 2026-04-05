import { TGrid, TGridConfig, TPosition, TShapeConfig } from "@/types/TGrid.js";
import { hexToRGBA } from "@/utils/UColors.js";
import { random } from "@/utils/UMath.js";

export class BaseShape {
    protected grid: TGrid;
    protected x: number = 0;
    protected y: number = 0;
    protected speed: number = 0.005;

    protected lastMoveTime: number = Date.now(); // Randomize initial move debounce time
    protected moveDuration: number = 1000; // Duration of the move in milliseconds
    protected minBounceTime: number = 0; // Minimum time in seconds before the shape can move again
    protected maxBounceTime: number = 10; // Maximum time in seconds before the shape can move again
    protected moveDebounce: number =
        1000 * random(this.minBounceTime, this.maxBounceTime); // Minimum time between moves in milliseconds

    protected canMove: boolean = true;
    protected isMoving: boolean = false;
    protected tailX: number = 0;
    protected tailY: number = 0;
    protected originalX: number = 0;
    protected originalY: number = 0;
    protected targetX: number = 0;
    protected targetY: number = 0;
    protected hasReachedTarget: boolean = false;
    protected hasTailReachedTarget: boolean = false;

    protected color: string = "white";

    protected lockedCells: TPosition[] = [];

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

    public moveTo(grid: TGrid, gridConfig: TGridConfig, x: number, y: number) {
        if (
            this.isMoving ||
            Date.now() - this.lastMoveTime < this.moveDebounce
        ) {
            return;
        }
        const lockedCells = this.genLockPath(grid, gridConfig, x, y);
        if (!lockedCells || !this.lockGridCells(grid, lockedCells, false)) {
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
        gridConfig: TGridConfig,
        targetX: number,
        targetY: number,
    ): TPosition[] | false {
        // Calculer la trajectoire entre la position actuelle et la position cible
        const startX = Math.round(this.x);
        const startY = Math.round(this.y);
        const endX = targetX;
        const endY = targetY;

        return this.getLineCells(startX, startY, endX, endY);
    }

    public lockGridCells(
        grid: TGrid,
        cells: TPosition[],
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
        _x0: number,
        _y0: number,
        _x1: number,
        _y1: number,
    ): TPosition[] {
        const cells: TPosition[] = [];

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

    protected calculateNewTarget(
        _grid: TGrid,
        _gridConfig: TGridConfig,
    ): void {}

    protected updatePosition(_grid: TGrid): void {}

    protected onMoveComplete(grid: TGrid, newX: number, newY: number): void {
        const savedX = this.originalX;
        const savedY = this.originalY;
        this.x = newX;
        this.y = newY;

        this.originalX = newX;
        this.originalY = newY;
        this.isMoving = false;
        this.lastMoveTime = Date.now();
        this.moveDebounce =
            1000 * random(this.minBounceTime, this.maxBounceTime); // Randomize next move debounce time
        this.unlockGridCells(grid);
        grid[savedY][savedX] = null; // Clear the original position in the grid
        grid[newY][newX] = this;

        const frames = (this.moveDuration / 1000) * 60;
        const speed = 1 / frames; // toujours en %

        this.speed = speed;

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

    public draw(_context: CanvasRenderingContext2D, _gridConfig: TGridConfig) {}

    public drawLockedCells(
        context: CanvasRenderingContext2D,
        gridConfig: TGridConfig,
    ) {
        const { cellSize, offsetX, offsetY } = gridConfig;

        const rgbColor = hexToRGBA(this.color, 0.2); // Convert hex color to rgba with 0.5 alpha

        context.fillStyle = "rgba(0, 255, 0, 0.2)"; // Green with transparency
        context.fillRect(
            this.originalX * cellSize + offsetX,
            this.originalY * cellSize + offsetY,
            cellSize,
            cellSize,
        );
        context.fillStyle = "rgba(255, 255, 0, 0.2)"; // Yellow with transparency
        context.fillRect(
            this.x * cellSize + offsetX,
            this.y * cellSize + offsetY,
            cellSize,
            cellSize,
        );

        context.fillStyle = rgbColor; // Red with transparency
        this.lockedCells.forEach(({ x, y }) => {
            const pixelX = x * cellSize + offsetX;
            const pixelY = y * cellSize + offsetY;
            context.fillRect(pixelX, pixelY, cellSize, cellSize);
        });
    }
}
