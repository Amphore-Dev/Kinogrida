import {
    TGrid,
    TGridConfig,
    TLockedCell,
    TShapeConfig,
} from "@/types/TGrid.js";
import { BaseShape } from "./BaseShape.js";
import { clamp, randomInt } from "@/utils/UMath.js";

export class SquareShape extends BaseShape {
    protected radiusPercent: number = 0;

    constructor(
        grid: TGrid,
        x: number = 0,
        y: number = 0,
        options: TShapeConfig,
    ) {
        super(grid, x, y, options);
        this.radiusPercent = options.radiusPercent ?? 0;
    }

    protected getLineCells(
        x0: number,
        y0: number,
        x1: number,
        y1: number,
    ): TLockedCell[] {
        const cells: TLockedCell[] = [];

        // Mouvement horizontal
        if (y0 === y1) {
            const startX = Math.min(x0, x1);
            const endX = Math.max(x0, x1);
            for (let x = startX; x <= endX; x++) {
                cells.push({ x, y: y0 });
            }
        }
        // Mouvement vertical
        else if (x0 === x1) {
            const startY = Math.min(y0, y1);
            const endY = Math.max(y0, y1);
            for (let y = startY; y <= endY; y++) {
                cells.push({ x: x0, y });
            }
        }

        return cells;
    }

    protected calculateNewTarget(grid: TGrid, gridConfig: TGridConfig): void {
        const newDirection = randomInt(1, 4); // 1: up, 2: right, 3: down, 4: left
        const newY = [1, 3].includes(newDirection)
            ? clamp(
                  this.y +
                      randomInt(1, gridConfig.nbrColumns / 2 - 1) *
                          (newDirection === 1 ? -1 : 1),
                  0,
                  gridConfig.nbrColumns - 1,
              )
            : this.y;

        const newX = [2, 4].includes(newDirection)
            ? clamp(
                  this.x +
                      randomInt(1, gridConfig.nbrRows / 2 - 1) *
                          (newDirection === 2 ? -1 : 1),
                  0,
                  gridConfig.nbrRows - 1,
              )
            : this.x;

        if (grid[newY][newX] === null && (newX !== this.x || newY !== this.y)) {
            this.moveTo(grid, newX, newY);
        }
    }

    protected updatePosition(grid: TGrid): void {
        if (this.hasReachedTarget) {
            // Check if the item has reached its target position
            if (Math.abs(this.tailX - this.targetX) > this.speed) {
                this.tailX +=
                    this.tailX < this.targetX ? this.speed : -this.speed;
            } else {
                this.tailX = this.targetX;
            }

            if (Math.abs(this.tailY - this.targetY) > this.speed) {
                this.tailY +=
                    this.tailY < this.targetY ? this.speed : -this.speed;
            } else {
                this.tailY = this.targetY;
            }

            if (this.tailX === this.targetX && this.tailY === this.targetY) {
                this.onMoveComplete(grid);
            }
        } else {
            // Example: Move towards target position
            if (Math.abs(this.x - this.targetX) > this.speed) {
                this.x += this.x < this.targetX ? this.speed : -this.speed;
            } else {
                this.x = this.targetX;
            }

            if (Math.abs(this.y - this.targetY) > this.speed) {
                this.y += this.y < this.targetY ? this.speed : -this.speed;
            } else {
                this.y = this.targetY;
            }

            // Check if the item has reached its target position
            if (this.x === this.targetX && this.y === this.targetY) {
                this.hasReachedTarget = true;
            }
        }
    }

    public draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig) {
        const { cellSize, offsetX, offsetY } = gridConfig;

        // Calculer les positions en pixels pour les coordonnées originales et actuelles
        const originalPixelX = this.tailX * cellSize + offsetX + cellSize * 0.1;
        const originalPixelY = this.tailY * cellSize + offsetY + cellSize * 0.1;
        const currentPixelX = this.x * cellSize + offsetX + cellSize * 0.1;
        const currentPixelY = this.y * cellSize + offsetY + cellSize * 0.1;

        // Calculer les coordonnées du rectangle qui s'étend de original à current
        const startX = Math.min(originalPixelX, currentPixelX);
        const startY = Math.min(originalPixelY, currentPixelY);
        const endX = Math.max(originalPixelX, currentPixelX);
        const endY = Math.max(originalPixelY, currentPixelY);

        // Taille du rectangle couvrant la zone entre original et current
        const rectWidth = endX - startX + cellSize * 0.8;
        const rectHeight = endY - startY + cellSize * 0.8;

        context.lineWidth = gridConfig.lineWidth;
        context.strokeStyle = this.color;
        this.strokeRoundedRect(
            context,
            startX,
            startY,
            rectWidth,
            rectHeight,
            this.radiusPercent,
        );

        context.strokeStyle = "white";
        this.strokeRoundedRect(
            context,
            startX + cellSize * 0.2,
            startY + cellSize * 0.2,
            rectWidth - cellSize * 0.4,
            rectHeight - cellSize * 0.4,
            this.radiusPercent,
        );
    }

    public strokeRoundedRect(
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radiusPercent: number = 0,
    ) {
        // Calculer le rayon réel basé sur le pourcentage et la plus petite dimension
        const minDimension = Math.min(width, height);
        const radius = Math.min(
            (minDimension * Math.max(0, Math.min(100, radiusPercent))) / 200,
            minDimension / 2,
        );

        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.arcTo(x + width, y, x + width, y + radius, radius);
        context.lineTo(x + width, y + height - radius);
        context.arcTo(
            x + width,
            y + height,
            x + width - radius,
            y + height,
            radius,
        );
        context.lineTo(x + radius, y + height);
        context.arcTo(x, y + height, x, y + height - radius, radius);
        context.lineTo(x, y + radius);
        context.arcTo(x, y, x + radius, y, radius);
        context.closePath();
        context.stroke();
    }
}
