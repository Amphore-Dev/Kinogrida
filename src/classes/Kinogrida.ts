import { TGridCell, TGridConfig } from "@/types/TGrid.js";
import { BaseShape } from "./BaseShape.js";
import { SquareShape } from "./SquareShape.js";
import { randomInt } from "@/utils/UMath.js";
import { getRandomColorPalette } from "@/utils/UColors.js";

export class Kinogrida {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private isPlaying = false;

    private gridConfig: TGridConfig = {
        nbrColumns: 16,
        nbrRows: 16,
        cellSize: 1,
        gridMargin: 50,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        lineWidth: 1,
    };

    private grid: TGridCell[][] = [];
    private cells: BaseShape[] = [];
    private isInitialized: boolean = false;

    private boundHandleResize: () => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Cannot get 2D context from canvas");
        }
        this.context = context;

        this.boundHandleResize = this.handleResize.bind(this);

        this.setupCanvas();
    }

    private setupCanvas(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.attachEventListeners();
        this.initGrid();
        this.isInitialized = true;
    }

    private initGrid(): void {
        this.grid = [];
        const { nbrColumns, nbrRows } = this.gridConfig;

        for (let i = 0; i < nbrRows; i++) {
            const row: (TGridCell | null)[] = [];
            for (let j = 0; j < nbrColumns; j++) {
                row.push(null);
            }
            this.grid.push(row);
        }

        // Example: Place a BaseItem in the center of the grid
        this.updateGridConfig();

        const colors = getRandomColorPalette();

        // debug
        const maxCells = 16 * 16;
        let addedCells = 0;
        const maxAttempts = 100;
        let attempts = 0;

        while (addedCells < maxCells && attempts < maxAttempts) {
            const x = randomInt(0, nbrColumns - 1);
            const y = randomInt(0, nbrRows - 1);

            if (this.grid[y][x] === null) {
                this.addCell(
                    new SquareShape(this.grid, x, y, {
                        color: colors[randomInt(0, colors.length - 1)],
                        radiusPercent: Math.random() < 0.5 ? 100 : 0,
                    }),
                    x,
                    y,
                );
                addedCells++;
            }
            attempts++;
        }
    }

    private addCell(item: BaseShape, x: number, y: number): void {
        if (this.grid[y][x] === null) {
            this.grid[y][x] = item;
            this.cells.push(item);
        } else {
            console.warn(`Cell (${x}, ${y}) is already occupied`);
        }
    }

    private updateGridConfig(): void {
        const { nbrColumns, nbrRows, gridMargin } = this.gridConfig;

        const cellSize = Math.floor(
            Math.min(
                (this.canvas.width - 2 * gridMargin) / nbrColumns,
                (this.canvas.height - 2 * gridMargin) / nbrRows,
            ),
        );

        const gridWidth = nbrColumns * cellSize;
        const gridHeight = nbrRows * cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;
        const lineWidth = Math.max(1, Math.floor(cellSize * 0.1));
        this.gridConfig = {
            ...this.gridConfig,
            offsetX,
            offsetY,
            width: gridWidth,
            height: gridHeight,
            cellSize,
            lineWidth,
        };

        console.log("Grid config updated:", this.gridConfig);
    }

    private drawGrid(): void {
        const {
            nbrColumns,
            nbrRows,
            offsetX,
            offsetY,
            cellSize,
            width,
            height,
        } = this.gridConfig;
        this.context.strokeStyle = "white";
        this.context.lineWidth = 1;

        for (let i = 0; i <= nbrColumns; i++) {
            const x = offsetX + i * cellSize;
            this.context.beginPath();
            this.context.moveTo(x, offsetY);
            this.context.lineTo(x, offsetY + height);
            this.context.stroke();
        }

        for (let j = 0; j <= nbrRows; j++) {
            const y = offsetY + j * cellSize;
            this.context.beginPath();
            this.context.moveTo(offsetX, y);
            this.context.lineTo(offsetX + width, y);
            this.context.stroke();
        }
    }

    private drawLockedCells(): void {
        this.cells.forEach((cell) => {
            cell.drawLockedCells(this.context, this.gridConfig);
        });
    }

    private drawCells(): void {
        this.cells.forEach((cell) => {
            cell.update(this.grid, this.gridConfig, this.context);
        });
    }

    private handleResize(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.updateGridConfig();
        this.drawGrid();
    }

    private attachEventListeners(): void {
        window.addEventListener("resize", this.boundHandleResize);
    }

    private detachEventListeners(): void {
        window.removeEventListener("resize", this.boundHandleResize);
    }

    private animate = (): void => {
        if (!this.isInitialized || !this.isPlaying) return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // this.debug();
        this.drawCells();

        requestAnimationFrame(this.animate);
    };

    private debug = (): void => {
        this.drawGrid();
        this.drawLockedCells();
    };

    public play(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.animate();
    }

    public pause(): void {
        this.isPlaying = false;
    }

    public destroy(): void {
        this.pause();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.detachEventListeners();
    }
}
