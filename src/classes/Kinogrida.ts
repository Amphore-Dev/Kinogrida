import {
    TGridCell,
    TGridConfig,
    TPosition,
    TShapeConfig,
} from "@/types/TGrid.js";
import { BaseShape } from "./BaseShape.js";
import { randomInt } from "@/utils/UMath.js";
import { getRandomColorPalette } from "@/utils/UColors.js";
import { getRandomShapeType } from "@/utils/UShapes.js";
import {
    TDebugOptions,
    TEngineOptions,
    TKinogridaEventMap,
} from "@/types/TKinogrida.js";
import { SHAPES_TYPES, TShapeType } from "@/constants/CShapes.js";
import { CDEFAULT_GRID_CONFIG } from "@/constants/CKinogrida.js";

export class Kinogrida {
    // ── Canvas ──────────────────────────────────────────────
    #canvas: HTMLCanvasElement;
    #context: CanvasRenderingContext2D;

    // ── State ───────────────────────────────────────────────
    #isPlaying = false;
    #debugOptions: TDebugOptions = {
        showGrid: false,
        showStats: false,
        showLockedCells: false,
        showPath: false,
        showPosition: false,
    };
    #isInitialized: boolean = false;

    // ── FPS / Timing ────────────────────────────────────────
    #lastFrameTime: number = 0;
    #frameCount: number = 0;
    #fpsUpdateInterval: number = 1000;
    #lastFpsUpdate: number = 0;
    #currentFPS: number = 60;
    #deltaTime: number = 16.67;
    #animationFrameId: number | null = null;

    // ── Grid / Cells ────────────────────────────────────────
    #gridConfig: TGridConfig = {
        ...CDEFAULT_GRID_CONFIG,
        nbrColumns: Math.floor(window.innerWidth / 100),
        nbrRows: Math.floor(window.innerHeight / 100),
        debug: this.#debugOptions,
        context: null as unknown as CanvasRenderingContext2D,
        colors: getRandomColorPalette(),
    };
    #grid: TGridCell[][] = [];
    #cells: BaseShape[] = [];
    #fillPercentage: number = 0.2;

    // ── Input ───────────────────────────────────────────────
    #mouseOverCell: TPosition | null = null;
    #engineOptions: Partial<TEngineOptions>;

    // ── Events ──────────────────────────────────────────────
    #listeners: { [K in keyof TKinogridaEventMap]: TKinogridaEventMap[K][] } = {
        cellClick: [],
        moveStart: [],
        move: [],
        moveEnd: [],
    };

    // ── Bound handlers ──────────────────────────────────────
    #boundHandleResize: () => void;
    #boundHandleMouseOver: (e: MouseEvent) => void;
    #boundMouseClick: (e: MouseEvent) => void;

    // ════════════════════════════════════════════════════════
    //  Constructor
    // ════════════════════════════════════════════════════════

    constructor(canvas: HTMLCanvasElement, options: Partial<TGridConfig> = {}) {
        this.#canvas = canvas;
        this.#engineOptions = options;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Cannot get 2D context from canvas");
        }
        this.#context = context;

        this.#boundHandleResize = this.#handleResize.bind(this);
        this.#boundHandleMouseOver = this.#handleMouseOver.bind(this);
        this.#boundMouseClick = this.#handleMouseClick.bind(this);

        this.#setupCanvas(options);
        this.updateGridConfig(options);
    }

    // ════════════════════════════════════════════════════════
    //  Public – Lifecycle
    // ════════════════════════════════════════════════════════

    public play(): void {
        if (this.#isPlaying) return;
        this.#isPlaying = true;
        this.#lastFrameTime = 0;
        if (this.#animationFrameId === null) {
            this.#animationFrameId = requestAnimationFrame(this.#animate);
        }
    }

    public pause(): void {
        this.#isPlaying = false;
        if (this.#animationFrameId !== null) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }
    }

    public destroy(): void {
        this.pause();
        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#detachEventListeners();
    }

    // ════════════════════════════════════════════════════════
    //  Public – Grid
    // ════════════════════════════════════════════════════════

    public clearGrid(): void {
        this.#grid = [];
        this.#cells = [];
    }

    public initGrid(config: Partial<TGridConfig> = {}): void {
        this.clearGrid();
        this.updateGridConfig(config);

        const { nbrColumns, nbrRows } = this.#gridConfig;

        for (let i = 0; i < nbrRows; i++) {
            const row: (TGridCell | null)[] = [];
            for (let j = 0; j < nbrColumns; j++) {
                row.push(null);
            }
            this.#grid.push(row);
        }

        this.fillGridRandomly();
    }

    public fillGridRandomly(): void {
        const { nbrColumns, nbrRows } = this.#gridConfig;
        const colors = this.#gridConfig.colors;

        const maxCells = Math.max(
            1,
            Math.floor(nbrColumns * nbrRows * this.#fillPercentage),
        );
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
                        radiusPercent:
                            Math.random() < 0.5 ? this.#gridConfig.cellSize : 0,
                    }),
                    x,
                    y,
                );
                addedCells++;
                attempts = 0;
            }
            attempts++;
        }
    }

    public addCell(
        item: BaseShape | TShapeType,
        x: number,
        y: number,
        config?: TShapeConfig,
    ): void {
        if (typeof item === "string") {
            const ShapeConstructor = SHAPES_TYPES[item];
            item = new ShapeConstructor(this.#grid, x, y, {
                color: this.#gridConfig.colors[
                    randomInt(0, this.#gridConfig.colors.length - 1)
                ],
                radiusPercent: Math.random() < 0.5 ? 1 : 0,
                ...config,
            });
        }

        if (this.#grid[y][x] === null) {
            this.#grid[y][x] = item;
            this.#cells.push(item);
            (item as BaseShape).setEmitter((event, ...args) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this.#emit as (event: string, ...args: any[]) => void)(
                    event,
                    ...args,
                );
            });
        }
    }

    // ════════════════════════════════════════════════════════
    //  Public – Config / API
    // ════════════════════════════════════════════════════════

    public updateGridConfig(config: Partial<TGridConfig> = {}): void {
        const { gridMargin, nbrColumns, nbrRows } = {
            ...this.#engineOptions,
            ...this.#gridConfig,
            ...config,
        };

        const cellSize = Math.floor(
            Math.min(
                (this.#canvas.width - 2 * gridMargin) / nbrColumns,
                (this.#canvas.height - 2 * gridMargin) / nbrRows,
            ),
        );

        const gridWidth = nbrColumns * cellSize;
        const gridHeight = nbrRows * cellSize;
        const offsetX = (this.#canvas.width - gridWidth) / 2;
        const offsetY = (this.#canvas.height - gridHeight) / 2;
        const lineWidth = Math.max(1, Math.floor(cellSize * 0.1));
        const colors = config.colors || getRandomColorPalette();

        this.#gridConfig = {
            ...this.#gridConfig,
            cellSize,
            lineWidth,
            debug: this.#debugOptions,
            context: this.#context,
            colors,
            ...config,
            offsetX,
            offsetY,
            width: gridWidth,
            height: gridHeight,
        };
    }

    #resolveDebug(value: boolean | TDebugOptions): TDebugOptions {
        if (typeof value === "boolean") {
            return {
                showGrid: value,
                showStats: value,
                showLockedCells: value,
                showPath: value,
                showPosition: value,
            };
        }
        return value;
    }

    public toggleDebugMode(value?: boolean | TDebugOptions): TDebugOptions {
        if (value === undefined) {
            // Toggle: if any option is on, turn all off; otherwise turn all on
            const allOff = Object.values(this.#debugOptions).every((v) => !v);
            this.#debugOptions = this.#resolveDebug(allOff);
        } else {
            this.#debugOptions = this.#resolveDebug(value);
        }
        this.#gridConfig.debug = this.#debugOptions;

        return this.#debugOptions;
    }

    public setFillPercentage(percentage: number): void {
        this.#fillPercentage = Math.max(0, Math.min(1, percentage));
        this.initGrid({
            colors: this.#gridConfig.colors,
        });
    }

    public getFillPercentage(): number {
        return this.#fillPercentage;
    }

    public getConfig(): TGridConfig {
        return this.#gridConfig;
    }

    public setConfig(
        config: Partial<TGridConfig>,
        reset: boolean = false,
    ): void {
        if (reset) {
            this.initGrid({
                ...config,
                colors: this.#gridConfig.colors,
            });
        } else {
            this.updateGridConfig(config);
        }
    }

    public getCurrentFPS(): number {
        return this.#currentFPS;
    }

    public getDeltaTime(): number {
        return this.#deltaTime;
    }

    public getSpeed(): number {
        return this.#gridConfig.speed;
    }

    public setSpeed(speed: number): void {
        this.#gridConfig.speed = speed;
    }

    // ════════════════════════════════════════════════════════
    //  Events Subscription
    // ════════════════════════════════════════════════════════

    public on<K extends keyof TKinogridaEventMap>(
        event: K,
        callback: TKinogridaEventMap[K],
    ): void {
        this.#listeners[event].push(callback);
    }

    public off<K extends keyof TKinogridaEventMap>(
        event: K,
        callback: TKinogridaEventMap[K],
    ): void {
        const list = this.#listeners[event];
        const index = list.indexOf(callback);
        if (index !== -1) list.splice(index, 1);
    }

    // ════════════════════════════════════════════════════════
    //  Private – Setup
    // ════════════════════════════════════════════════════════

    #setupCanvas(options: Partial<TGridConfig>): void {
        this.#setCanvasSize();
        this.#attachEventListeners();
        this.initGrid(options);
        this.#isInitialized = true;
    }

    #setCanvasSize(): void {
        this.#canvas.width = this.#canvas.clientWidth;
        this.#canvas.height = this.#canvas.clientHeight;

        const dpr = window.devicePixelRatio || 1;

        this.#canvas.width = this.#canvas.clientWidth * dpr;
        this.#canvas.height = this.#canvas.clientHeight * dpr;

        this.#context.scale(dpr, dpr);
    }

    #attachEventListeners(): void {
        window.addEventListener("resize", this.#boundHandleResize);
        this.#canvas.addEventListener("mousemove", this.#boundHandleMouseOver);
        this.#canvas.addEventListener("click", this.#boundMouseClick);
    }

    #detachEventListeners(): void {
        window.removeEventListener("resize", this.#boundHandleResize);
        this.#canvas.removeEventListener(
            "mousemove",
            this.#boundHandleMouseOver,
        );
        this.#canvas.removeEventListener("click", this.#boundMouseClick);
    }

    // ════════════════════════════════════════════════════════
    //  Private – Animation / Render
    // ════════════════════════════════════════════════════════

    // Arrow function to preserve `this` binding for requestAnimationFrame
    #animate = (currentTime: number = performance.now()): void => {
        if (!this.#isInitialized || !this.#isPlaying) {
            this.#animationFrameId = null;
            return;
        }

        if (this.#lastFrameTime > 0) {
            this.#deltaTime = currentTime - this.#lastFrameTime;
            this.#frameCount++;

            if (currentTime - this.#lastFpsUpdate >= this.#fpsUpdateInterval) {
                this.#currentFPS =
                    (this.#frameCount * 1000) /
                    (currentTime - this.#lastFpsUpdate);
                this.#frameCount = 0;
                this.#lastFpsUpdate = currentTime;
            }
        } else {
            this.#lastFpsUpdate = currentTime;
        }
        this.#lastFrameTime = currentTime;

        this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        this.#drawMouseOverHighlight();
        const dbg = this.#debugOptions;
        if (dbg.showGrid) {
            this.#drawGrid();
        }
        if (dbg.showLockedCells) {
            this.#drawLockedCells();
        }
        this.#drawCells();
        if (dbg.showPosition) {
            this.#drawCellPositions();
        }
        if (dbg.showStats) {
            this.#showStats();
        }

        this.#animationFrameId = requestAnimationFrame(this.#animate);
    };

    #drawCells(): void {
        this.#context.lineWidth = this.#gridConfig.lineWidth;
        this.#context.strokeStyle = "white";
        this.#cells.forEach((cell) => {
            cell.update(
                this.#grid,
                this.#gridConfig,
                this.#context,
                this.#deltaTime,
            );
        });
    }

    #drawGrid(): void {
        const {
            nbrColumns,
            nbrRows,
            offsetX,
            offsetY,
            cellSize,
            width,
            height,
        } = this.#gridConfig;
        this.#context.strokeStyle = "white";
        this.#context.lineWidth = 1;

        for (let i = 0; i <= nbrColumns; i++) {
            const x = offsetX + i * cellSize;
            this.#context.beginPath();
            this.#context.moveTo(x, offsetY);
            this.#context.lineTo(x, offsetY + height);
            this.#context.stroke();
        }

        for (let j = 0; j <= nbrRows; j++) {
            const y = offsetY + j * cellSize;
            this.#context.beginPath();
            this.#context.moveTo(offsetX, y);
            this.#context.lineTo(offsetX + width, y);
            this.#context.stroke();
        }
    }

    #drawLockedCells(): void {
        this.#cells.forEach((cell) => {
            cell.drawLockedCells(this.#context, this.#gridConfig);
        });
    }

    #drawCellPositions(): void {
        const { cellSize, offsetX, offsetY, nbrColumns, nbrRows } =
            this.#gridConfig;

        for (let y = 0; y < nbrRows; y++) {
            for (let x = 0; x < nbrColumns; x++) {
                const cell = this.#grid[y][x];
                if (cell instanceof BaseShape) {
                    const centerX = offsetX + x * cellSize + cellSize / 2;
                    const centerY = offsetY + y * cellSize + cellSize / 2;

                    this.#context.fillStyle = "white";
                    this.#context.font = `${cellSize * 0.3}px Arial`;
                    this.#context.textAlign = "center";
                    this.#context.textBaseline = "middle";
                    this.#context.fillText(`(${x},${y})`, centerX, centerY);
                }
            }
        }
    }

    #drawMouseOverHighlight(): void {
        if (!this.#mouseOverCell || !this.#gridConfig.showMouseHighlight)
            return;

        const { x, y } = this.#mouseOverCell;
        const { offsetX, offsetY, cellSize } = this.#gridConfig;

        if (!this.#grid[y] || this.#grid[y][x] === undefined) return;

        if (this.#grid[y][x] !== null)
            this.#context.fillStyle = "rgba(255, 0, 0, 0.2)";
        else this.#context.fillStyle = "rgba(255, 255, 255, 0.2)";
        this.#context.beginPath();
        this.#context.roundRect(
            offsetX + x * cellSize,
            offsetY + y * cellSize,
            cellSize,
            cellSize,
            8,
        );
        this.#context.fill();
        this.#context.closePath();
    }

    #showStats(): void {
        this.#context.fillStyle = "white";
        this.#context.font = "16px Arial";
        this.#context.textAlign = "left";
        this.#context.fillStyle = "rgba(0, 0, 0, 0.5)";
        this.#context.fillRect(5, 5, 120, 70);
        this.#context.fillStyle = "white";
        this.#context.fillText(`FPS: ${Math.floor(this.#currentFPS)}`, 10, 20);
        this.#context.fillText(`Cells: ${this.#cells.length}`, 10, 40);
        this.#context.fillText(
            `Grid: ${this.#grid.length}x${this.#grid[0]?.length || 0}`,
            10,
            60,
        );
    }

    // ════════════════════════════════════════════════════════
    //  Private – Event handlers
    // ════════════════════════════════════════════════════════

    #handleResize(): void {
        this.#setCanvasSize();

        this.updateGridConfig({
            colors: this.#gridConfig.colors,
        });
        this.#drawGrid();
    }

    #getMousePosition(e: MouseEvent): TPosition | null {
        const { offsetX, offsetY, cellSize } = this.#gridConfig;
        const gridX = Math.floor((e.offsetX - offsetX) / cellSize);
        const gridY = Math.floor((e.offsetY - offsetY) / cellSize);
        if (
            gridX >= 0 &&
            gridX < this.#gridConfig.nbrColumns &&
            gridY >= 0 &&
            gridY < this.#gridConfig.nbrRows
        ) {
            return { x: gridX, y: gridY };
        }
        return null;
    }

    #handleMouseOver(e: MouseEvent): void {
        const cellPos = this.#getMousePosition(e);
        this.#mouseOverCell = cellPos;
    }

    #handleMouseClick(e: MouseEvent): void {
        const cellPos = this.#getMousePosition(e);
        this.#emit("cellClick", cellPos?.x ?? -1, cellPos?.y ?? -1, !!cellPos);
    }

    #emit<K extends keyof TKinogridaEventMap>(
        event: K,
        ...args: Parameters<TKinogridaEventMap[K]>
    ): void {
        this.#listeners[event].forEach((cb) =>
            (cb as (...a: Parameters<TKinogridaEventMap[K]>) => void)(...args),
        );
    }
}
