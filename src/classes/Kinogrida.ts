import { TGridCell, TGridConfig } from "@/types/TGrid.js";
import { BaseShape } from "./BaseShape.js";
import { randomInt } from "@/utils/UMath.js";
import { getRandomColorPalette } from "@/utils/UColors.js";
import { getRandomShapeType } from "@/utils/UShapes.js";

export class Kinogrida {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    #isPlaying = false;
    #debugMode = false;

    #gridConfig: TGridConfig = {
        nbrColumns: Math.floor(window.innerWidth / 100),
        nbrRows: Math.floor(window.innerHeight / 100),
        cellSize: 1,
        gridMargin: 50,
        offsetX: 0,
        offsetY: 0,
        width: 0,
        height: 0,
        lineWidth: 1,
        debug: this.#debugMode,
        context: null as unknown as CanvasRenderingContext2D, // Will be set in setupCanvas
        colors: getRandomColorPalette(),
    };

    #grid: TGridCell[][] = [];
    #cells: BaseShape[] = [];
    #isInitialized: boolean = false;
    #fillPercentage: number = 0.2; // Fill 20% of the grid with shapes

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
        this.#isInitialized = true;
    }

    public clearGrid(): void {
        this.#grid = [];
        this.#cells = [];
    }

    public initGrid(config: Partial<TGridConfig> = {}): void {
        this.clearGrid();
        const { nbrColumns, nbrRows } = this.#gridConfig;

        for (let i = 0; i < nbrRows; i++) {
            const row: (TGridCell | null)[] = [];
            for (let j = 0; j < nbrColumns; j++) {
                row.push(null);
            }
            this.#grid.push(row);
        }

        // Example: Place a BaseItem in the center of the grid
        this.updateGridConfig(config);

        const colors = this.#gridConfig.colors;

        const maxCells = Math.floor(
            nbrColumns * nbrRows * this.#fillPercentage,
        );
        // debug
        // const maxCells = 10;
        let addedCells = 0;
        const maxAttempts = 100;
        let attempts = 0;

        while (addedCells < maxCells && attempts < maxAttempts) {
            const x = randomInt(0, nbrColumns - 1);
            const y = randomInt(0, nbrRows - 1);

            if (this.#grid[y][x] === null) {
                const ShapeConstructor = getRandomShapeType();
                this.addCell(
                    new ShapeConstructor(this.#grid, x, y, {
                        color: colors[randomInt(0, colors.length - 1)],
                        radiusPercent: Math.random() < 0.5 ? 100 : 0,
                    }),
                    x,
                    y,
                );
                addedCells++;
                attempts = 0; // Reset attempts after successfully adding a cell
            }
            attempts++;
        }
    }

    public addCell(item: BaseShape, x: number, y: number): void {
        if (this.#grid[y][x] === null) {
            this.#grid[y][x] = item;
            this.#cells.push(item);
        }
    }

    public updateGridConfig(config: Partial<TGridConfig> = {}): void {
        const { gridMargin, nbrColumns, nbrRows } = this.#gridConfig;

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
        const colors = config.colors || getRandomColorPalette();

        this.#gridConfig = {
            ...this.#gridConfig,
            offsetX,
            offsetY,
            width: gridWidth,
            height: gridHeight,
            cellSize,
            lineWidth,
            debug: this.#debugMode,
            context: this.context,
            colors,
            ...config,
        };
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
        } = this.#gridConfig;
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
        this.#cells.forEach((cell) => {
            cell.drawLockedCells(this.context, this.#gridConfig);
        });
    }

    private drawCellPositions(): void {
        const { cellSize, offsetX, offsetY, nbrColumns, nbrRows } =
            this.#gridConfig;

        for (let y = 0; y < nbrRows; y++) {
            for (let x = 0; x < nbrColumns; x++) {
                const cell = this.#grid[y][x];
                if (cell instanceof BaseShape) {
                    const centerX = offsetX + x * cellSize + cellSize / 2;
                    const centerY = offsetY + y * cellSize + cellSize / 2;

                    this.context.fillStyle = "white";
                    this.context.font = `${cellSize * 0.3}px Arial`;
                    this.context.textAlign = "center";
                    this.context.textBaseline = "middle";
                    this.context.fillText(`(${x},${y})`, centerX, centerY);
                }
            }
        }
    }

    private drawCells(): void {
        this.context.lineWidth = this.#gridConfig.lineWidth;
        this.#cells.forEach((cell) => {
            cell.update(this.#grid, this.#gridConfig, this.context);
        });
    }

    private handleResize(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.updateGridConfig({
            colors: this.#gridConfig.colors, // Preserve the current color palette
        });
        this.drawGrid();
    }

    public toggleDebugMode(): void {
        this.#debugMode = !this.#debugMode;
        this.#gridConfig.debug = this.#debugMode;
    }

    private attachEventListeners(): void {
        window.addEventListener("resize", this.boundHandleResize);
    }

    private detachEventListeners(): void {
        window.removeEventListener("resize", this.boundHandleResize);
    }

    private animate = (): void => {
        if (!this.#isInitialized || !this.#isPlaying) return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.#debugMode) {
            this.debug();
        }
        this.drawCells();

        requestAnimationFrame(this.animate);
    };

    private debug = (): void => {
        this.drawGrid();
        this.drawLockedCells();
        this.drawCellPositions();
    };

    public play(): void {
        if (this.#isPlaying) return;
        this.#isPlaying = true;
        this.animate();
    }

    public pause(): void {
        this.#isPlaying = false;
    }

    public destroy(): void {
        this.pause();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.detachEventListeners();
    }

    public setFillPercentage(percentage: number): void {
        this.#fillPercentage = Math.max(0, Math.min(1, percentage));
        this.initGrid({
            colors: this.#gridConfig.colors, // Preserve the current color palette
        }); // Reinitialize the grid to apply the new fill percentage
    }

    public getFillPercentage(): number {
        return this.#fillPercentage;
    }

    public getConfig(): TGridConfig {
        return this.#gridConfig;
    }

    public setConfig(config: Partial<TGridConfig>): void {
        this.updateGridConfig(config);
    }
}
