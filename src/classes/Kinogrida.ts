export class Kinogrida {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private isPlaying = false;
    private gridConfig = {
        nbrColumns: 5,
        nbrRows: 5,
        cellSize: 1,
        gridMargin: 50,
    };

    private boundHandleResize: () => void;

    constructor(canvas: HTMLCanvasElement) {
        console.log("Kinogrida init", canvas);

        this.canvas = canvas;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Cannot get 2D context from canvas");
        }
        this.context = context;

        this.boundHandleResize = this.handleResize.bind(this);

        this.setupCanvas();
        console.log("Kinogrida context initialized", this.context);
    }

    private setupCanvas(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.attachEventListeners();
    }

    private initGrid(): void {
        //
    }

    private drawGrid(): void {
        const { nbrColumns, nbrRows, gridMargin } = this.gridConfig;
        const cellSize = Math.floor(
            Math.min(
                (this.canvas.width - 2 * gridMargin) / nbrColumns,
                (this.canvas.height - 2 * gridMargin) / nbrRows,
            ),
        );

        this.gridConfig.cellSize = cellSize;

        const gridWidth = nbrColumns * cellSize;
        const gridHeight = nbrRows * cellSize;
        const offsetX = (this.canvas.width - gridWidth) / 2;
        const offsetY = (this.canvas.height - gridHeight) / 2;

        this.context.strokeStyle = "white";
        this.context.lineWidth = 1;

        for (let i = 0; i <= nbrColumns; i++) {
            const x = offsetX + i * cellSize;
            this.context.beginPath();
            this.context.moveTo(x, offsetY);
            this.context.lineTo(x, offsetY + gridHeight);
            this.context.stroke();
        }

        for (let j = 0; j <= nbrRows; j++) {
            const y = offsetY + j * cellSize;
            this.context.beginPath();
            this.context.moveTo(offsetX, y);
            this.context.lineTo(offsetX + gridWidth, y);
            this.context.stroke();
        }
    }

    private handleResize(): void {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.drawGrid();
    }

    private attachEventListeners(): void {
        window.addEventListener("resize", this.boundHandleResize);
    }

    private detachEventListeners(): void {
        window.removeEventListener("resize", this.boundHandleResize);
    }

    private animate = (): void => {
        if (!this.isPlaying) return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();

        requestAnimationFrame(this.animate);
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
