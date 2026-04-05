import { TGrid, TGridConfig, TPosition, TShapeConfig } from "@/types/TGrid.js";
import { BaseShape } from "./BaseShape.js";
import { randomInt } from "@/utils/UMath.js";

export class ArcShape extends BaseShape {
    protected progress = 0;
    protected tailProgress = 0;
    protected angleOffset = 0;
    protected arc = 2;
    protected clockwise = true; // Sens de rotation : true = horaire, false = antihoraire
    protected rotationAmount = 0.25; // Amplitude de rotation : 0.25 (quart), 0.5 (demi), 0.75 (trois quarts), 1.0 (complet)

    private debugPath: {
        inner: TPosition[];
        outer: TPosition[];
        center: TPosition[];
    } = {
        inner: [],
        outer: [],
        center: [],
    };

    protected moveDuration = 4000; // Duration of the move in milliseconds
    constructor(
        grid: TGrid,
        x: number = 0,
        y: number = 0,
        options: TShapeConfig,
    ) {
        super(grid, x, y, options);
        this.color = options.color;
        this.angleOffset = this.genAngleOffset();
        // Ajouter la possibilité de configurer le sens de rotation
        this.clockwise = options.clockwise ?? true;
        // Configurer l'amplitude de rotation (par défaut quart de tour)
        this.rotationAmount = options.rotationAmount ?? 0.25;
        // this.color = "green";
    }

    private genAngleOffset() {
        const possibleAngles = [0, 0.25, 0.5, 0.75];
        return (
            possibleAngles[randomInt(0, possibleAngles.length - 1)] *
            Math.PI *
            2
        );
    }

    private calculateArcGeometry(
        gridConfig: TGridConfig,
        customAngleOffset?: number,
        customArc?: number,
    ) {
        const { cellSize, offsetX, offsetY, lineWidth } = gridConfig;
        const arc = customArc ?? this.arc;
        const angleOffset = customAngleOffset ?? this.angleOffset;

        const centerX = offsetX + this.x * cellSize + cellSize / 2;
        const centerY = offsetY + this.y * cellSize + cellSize / 2;

        const endAngle = angleOffset;
        const initAngle = endAngle - Math.PI;

        const rotationDirection = this.clockwise ? 1 : -1;
        const rotationAngle = 2 * Math.PI * this.rotationAmount; // Convertir en radians

        const startAngle =
            endAngle -
            Math.PI +
            rotationAngle * this.progress * rotationDirection;

        const tailAngle =
            endAngle -
            Math.PI +
            rotationAngle * this.tailProgress * rotationDirection;

        const arcRadius = cellSize * arc;

        const arcCenterX = centerX + cellSize * arc * Math.cos(endAngle);
        const arcCenterY = centerY + cellSize * arc * Math.sin(endAngle);

        return {
            centerX,
            centerY,
            endAngle,
            initAngle,
            startAngle,
            tailAngle,
            arcRadius,
            arcCenterX,
            arcCenterY,
            cellSize,
            lineWidth,
            rotationDirection,
            offsetX,
            offsetY,
        };
    }

    private drawArcElements(
        context: CanvasRenderingContext2D,
        geometry: ReturnType<typeof this.calculateArcGeometry>,
        color: string,
        width: number,
    ) {
        const {
            arcCenterX,
            arcCenterY,
            arcRadius,
            startAngle,
            tailAngle,
            initAngle,
            lineWidth,
            rotationDirection,
        } = geometry;

        const halfWidth = width / 2;

        context.lineWidth = lineWidth;
        context.strokeStyle = color;

        const startX = arcCenterX + arcRadius * Math.cos(startAngle);
        const startY = arcCenterY + arcRadius * Math.sin(startAngle);

        const endX = arcCenterX + arcRadius * Math.cos(tailAngle);
        const endY = arcCenterY + arcRadius * Math.sin(tailAngle);
        const rotationAngle = 2 * Math.PI * this.rotationAmount;
        const arcStartAngle =
            initAngle + rotationAngle * this.tailProgress * rotationDirection;
        const arcEndAngle =
            initAngle + rotationAngle * this.progress * rotationDirection;

        // Start cap
        context.beginPath();
        context.arc(
            startX,
            startY,
            halfWidth,
            this.clockwise ? startAngle : startAngle - Math.PI,
            this.clockwise ? startAngle + Math.PI : startAngle,
        );
        context.stroke();

        // End cap
        context.beginPath();
        context.arc(
            endX,
            endY,
            halfWidth,
            this.clockwise ? tailAngle - Math.PI : tailAngle,
            this.clockwise ? tailAngle : tailAngle - Math.PI,
        );
        context.stroke();

        // Outer arc
        context.beginPath();
        context.arc(
            arcCenterX,
            arcCenterY,
            arcRadius + halfWidth,
            arcStartAngle,
            arcEndAngle,
            !this.clockwise,
        );
        context.stroke();

        // Inner arc
        context.beginPath();
        context.arc(
            arcCenterX,
            arcCenterY,
            arcRadius - halfWidth,
            arcStartAngle,
            arcEndAngle,
            !this.clockwise,
        );
        context.stroke();
    }

    public drawArc(context: CanvasRenderingContext2D, gridConfig: TGridConfig) {
        const geometry = this.calculateArcGeometry(gridConfig);

        const baseSize = gridConfig.cellSize * 0.8;
        context.lineCap = "round";

        this.drawArcElements(context, geometry, this.color, baseSize);

        this.drawArcElements(
            context,
            geometry,
            "white",
            baseSize - geometry.lineWidth * 4,
        );

        this.updateAnimationProgress(geometry);
    }

    public draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig) {
        this.drawArc(context, gridConfig);
        if (gridConfig.debug) {
            this.drawDebugPath(context);
        }
    }

    private drawDebugPath(context: CanvasRenderingContext2D) {
        if (!this.debugPath || !this.isMoving) return;

        context.lineWidth = 1;
        context.strokeStyle = "red";
        context.beginPath();
        this.debugPath.center.forEach((pos, index) => {
            if (index === 0) {
                context.moveTo(pos.x, pos.y);
            } else {
                context.lineTo(pos.x, pos.y);
            }
        });
        context.stroke();

        context.strokeStyle = "blue";
        context.beginPath();
        this.debugPath.inner.forEach((pos, index) => {
            if (index === 0) {
                context.moveTo(pos.x, pos.y);
            } else {
                context.lineTo(pos.x, pos.y);
            }
        });
        context.stroke();

        context.strokeStyle = "green";
        context.beginPath();
        this.debugPath.outer.forEach((pos, index) => {
            if (index === 0) {
                context.moveTo(pos.x, pos.y);
            } else {
                context.lineTo(pos.x, pos.y);
            }
        });
        context.stroke();
    }

    private updateAnimationProgress(
        geometry: ReturnType<typeof this.calculateArcGeometry>,
    ) {
        if (!this.isMoving) return;

        const { arcCenterX, arcCenterY, arcRadius, endAngle, cellSize } =
            geometry;

        if (
            !this.hasReachedTarget &&
            (this.progress >= 1 || this.progress + this.speed >= 1)
        ) {
            this.progress = 1;
            this.hasReachedTarget = true;
        } else if (
            this.tailProgress >= 1 ||
            (this.tailProgress + this.speed >= 1 && this.hasReachedTarget)
        ) {
            this.tailProgress = 1;
            // Calculer la position finale en tenant compte de la direction de rotation
            const rotationDirection = this.clockwise ? 1 : -1;
            const rotationAngle = 2 * Math.PI * this.rotationAmount;
            const finalAngle =
                endAngle - Math.PI + rotationAngle * rotationDirection;

            const newX = Math.floor(
                (arcCenterX +
                    arcRadius * Math.cos(finalAngle) -
                    geometry.offsetX) /
                    cellSize,
            );
            const newY = Math.floor(
                (arcCenterY +
                    arcRadius * Math.sin(finalAngle) -
                    geometry.offsetY) /
                    cellSize,
            );

            this.onMoveComplete(this.grid, newX, newY);
        } else if (this.progress < 1) {
            this.progress += this.speed;
        } else if (this.progress >= 1 && this.tailProgress < 1) {
            this.tailProgress += this.speed;
        }
    }

    protected onMoveComplete(grid: TGrid, newX: number, newY: number): void {
        super.onMoveComplete(grid, newX, newY);
        this.progress = 0;
        this.tailProgress = 0;
        this.isMoving = false;
        this.hasReachedTarget = true;
        this.hasTailReachedTarget = true;
    }

    protected calculateNewTarget(grid: TGrid, gridConfig: TGridConfig): void {
        if (this.isMoving) {
            return;
        }

        const { nbrColumns, nbrRows } = gridConfig;
        const newOffset = this.genAngleOffset();
        const newArc = randomInt(1, Math.min(nbrColumns, nbrRows) / 2 - 1);
        // Générer aléatoirement le sens de rotation dès le début
        const newClockwise = Math.random() > 0.5;
        // Générer aléatoirement l'amplitude de rotation
        const rotationAmounts = [0.25, 0.5, 0.75]; // quart, demi, trois quarts, complet
        const newRotationAmount =
            rotationAmounts[randomInt(0, rotationAmounts.length - 1)];

        // Utiliser calculateArcGeometry avec les nouveaux paramètres
        const { arcCenterX, arcCenterY, arcRadius, endAngle, cellSize } =
            this.calculateArcGeometry(gridConfig, newOffset, newArc);

        // Calculer la position finale en tenant compte de la direction de rotation
        const rotationDirection = newClockwise ? 1 : -1;
        const rotationAngle = 2 * Math.PI * newRotationAmount;
        const finalAngle =
            endAngle - Math.PI + rotationAngle * rotationDirection;

        const endX = Math.floor(
            (arcCenterX +
                arcRadius * Math.cos(finalAngle) -
                gridConfig.offsetX) /
                cellSize,
        );
        const endY = Math.floor(
            (arcCenterY +
                arcRadius * Math.sin(finalAngle) -
                gridConfig.offsetY) /
                cellSize,
        );

        if (
            endX >= 0 &&
            endX < nbrColumns &&
            endY >= 0 &&
            endY < nbrRows &&
            grid[endY][endX] === null &&
            (endX !== this.x || endY !== this.y)
        ) {
            this.arc = newArc;
            this.angleOffset = newOffset;
            this.clockwise = newClockwise;
            this.rotationAmount = newRotationAmount;

            const frames = (this.moveDuration / 1000) * 60;
            const speed = 1 / frames; // toujours en %

            this.speed = speed;

            this.moveTo(grid, gridConfig, endX, endY);
        }
    }

    public genLockPath(
        grid: TGrid,
        gridConfig: TGridConfig,
    ): TPosition[] | false {
        const path: TPosition[] = [];
        const pathKeys = new Set<string>();

        const geometry = this.calculateArcGeometry(gridConfig);
        const {
            arcCenterX,
            arcCenterY,
            arcRadius,
            endAngle,
            rotationDirection,
            offsetX,
            offsetY,
            cellSize,
        } = geometry;

        const width = gridConfig.cellSize;
        const halfWidth = width * 0.5 - gridConfig.lineWidth * 0.51;

        const steps = Math.max(
            10,
            this.arc * this.arc * (this.rotationAmount * 8),
        );

        const addPoint = (worldX: number, worldY: number) => {
            const gridX = Math.floor((worldX - offsetX) / cellSize);
            const gridY = Math.floor((worldY - offsetY) / cellSize);

            if (!this.isValidGridPosition(gridX, gridY, grid)) {
                return false;
            }

            const key = `${gridX}:${gridY}`;

            if (pathKeys.has(key)) {
                return true;
            }

            pathKeys.add(key);
            path.push({ x: gridX, y: gridY });
            return true;
        };

        if (gridConfig.debug) this.resetDebugPath();

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;

            const rotationAngle = 2 * Math.PI * this.rotationAmount;
            const angle =
                endAngle -
                Math.PI +
                rotationAngle * progress * rotationDirection;

            const centerX = arcCenterX + arcRadius * Math.cos(angle);
            const centerY = arcCenterY + arcRadius * Math.sin(angle);

            if (gridConfig.debug)
                this.debugPath.center.push({ x: centerX, y: centerY });

            const innerRadius = Math.max(0.001, arcRadius - halfWidth);
            const innerX = arcCenterX + innerRadius * Math.cos(angle);
            const innerY = arcCenterY + innerRadius * Math.sin(angle);

            if (gridConfig.debug)
                this.debugPath.inner.push({ x: innerX, y: innerY });

            const outerRadius = arcRadius + halfWidth;
            const outerX = arcCenterX + outerRadius * Math.cos(angle);
            const outerY = arcCenterY + outerRadius * Math.sin(angle);

            if (gridConfig.debug)
                this.debugPath.outer.push({ x: outerX, y: outerY });

            const checkCenter = addPoint(centerX, centerY);
            const checkInner = addPoint(innerX, innerY);
            const checkOuter = addPoint(outerX, outerY);

            if (!checkCenter || !checkInner || !checkOuter) {
                // Si l'une des positions n'est pas valide, arrêter de générer le chemin
                if (gridConfig.debug) this.resetDebugPath();
                return false;
            }
        }

        return path;
    }

    private isValidGridPosition(x: number, y: number, grid: TGrid): boolean {
        return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
    }

    private resetDebugPath() {
        this.debugPath = {
            inner: [],
            outer: [],
            center: [],
        };
    }
}
