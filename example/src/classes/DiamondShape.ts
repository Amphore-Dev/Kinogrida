import {
  BaseShape,
  TGrid,
  TGridConfig,
  TPosition,
  TShapeConfig,
} from "@amphore-dev/kinogrida";
import { randomInt } from "../utils";

const quarterTurn = Math.PI / 4;
const directions = [
  quarterTurn,
  quarterTurn * 3,
  quarterTurn * 5,
  quarterTurn * 7,
];

export class DiamondShape extends BaseShape {
  protected angle: number = 0;
  protected moveDistance: number = 0;

  constructor(
    grid: TGrid,
    x: number = 0,
    y: number = 0,
    options: TShapeConfig
  ) {
    super(grid, x, y, options);
    // diretion in radian

    this.angle = directions[randomInt(0, directions.length - 1)];
    this.moveDistance = randomInt(1, 5);
  }

  drawShape(context: CanvasRenderingContext2D, gridConfig: TGridConfig): void {
    const { cellSize, offsetX, offsetY, lineWidth } = gridConfig;

    const baseSize = cellSize * 0.8 - gridConfig.lineWidth;

    const centerX = this.x * cellSize + cellSize / 2 + offsetX;
    const centerY = this.y * cellSize + cellSize / 2 + offsetY;

    const dCenterX = centerX + baseSize * Math.cos(this.angle) * this.progress;
    const dCenterY = centerY + baseSize * Math.sin(this.angle) * this.progress;

    context.lineWidth = lineWidth;
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(dCenterX, dCenterY - baseSize / 2);
    context.lineTo(dCenterX + baseSize / 2, dCenterY);
    context.lineTo(dCenterX, dCenterY + baseSize / 2);
    context.lineTo(dCenterX - baseSize / 2, dCenterY);
    context.closePath();
    context.stroke();

    const innerSize = baseSize * 0.6;
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(dCenterX, dCenterY - innerSize / 2 + lineWidth);
    context.lineTo(dCenterX + innerSize / 2 - lineWidth, dCenterY);
    context.lineTo(dCenterX, dCenterY + innerSize / 2 - lineWidth);
    context.lineTo(dCenterX - innerSize / 2 + lineWidth, dCenterY);
    context.closePath();
    context.stroke();
  }

  draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig): void {
    this.drawShape(context, gridConfig);

    const showPath =
      typeof gridConfig.debug === "object" && gridConfig.debug.showPath;
    if (showPath) {
      this.drawDebugPath(context);
    }
  }

  protected calculateNewTarget(grid: TGrid, gridConfig: TGridConfig): void {
    if (this.isMoving || Date.now() - this.lastMoveTime < this.moveDebounce) {
      return;
    }
    const newAngle = directions[randomInt(0, directions.length - 1)];
    const newMoveDistance = randomInt(1, 5);

    const { cellSize, offsetX, offsetY, lineWidth } = gridConfig;
    const baseSize = cellSize * 0.8 - lineWidth;

    const centerX = this.x * cellSize + cellSize / 2 + offsetX;
    const centerY = this.y * cellSize + cellSize / 2 + offsetY;

    const targetX = Math.floor(
      (centerX +
        baseSize * Math.cos(newAngle) * newMoveDistance * 2 -
        offsetX) /
        cellSize
    );
    const targetY = Math.floor(
      (centerY +
        baseSize * Math.sin(newAngle) * newMoveDistance * 2 -
        offsetY) /
        cellSize
    );

    this.angle = newAngle;
    this.moveDistance = newMoveDistance;

    this.moveTo(grid, gridConfig, targetX, targetY);
  }

  protected updatePosition(grid: TGrid): void {
    const step = this.speed * this.moveDistance;
    if (this.hasReachedTarget) {
      if (Math.abs(this.tailProgress - this.moveDistance) > step) {
        this.tailProgress += step;
      } else {
        this.tailProgress = this.moveDistance;
      }
      if (this.tailProgress === this.moveDistance) {
        this.onMoveComplete(grid, this.targetX, this.targetY);
      }
    } else {
      if (Math.abs(this.progress - this.moveDistance) > step) {
        this.progress += step;
      } else {
        this.progress = this.moveDistance;
      }
      if (this.progress === this.moveDistance) {
        this.hasReachedTarget = true;
      }
    }
  }

  public genLockPath(grid: TGrid, gridConfig: TGridConfig) {
    const path: TPosition[] = [];
    const pathKeys = new Set<string>();
    const { cellSize, offsetX, offsetY } = gridConfig;

    const baseSize = cellSize * 0.8 - gridConfig.lineWidth;
    const halfSize = (baseSize - gridConfig.lineWidth) / 2;

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

    const showPath =
      typeof gridConfig.debug === "object" && gridConfig.debug.showPath;
    if (showPath) {
      this.resetDebugPath();
    }

    const centerX = this.x * cellSize + cellSize / 2 + offsetX;
    const centerY = this.y * cellSize + cellSize / 2 + offsetY;

    const extXStart =
      centerX + halfSize * Math.cos(this.angle - quarterTurn * 2);
    const extYStart =
      centerY + halfSize * Math.sin(this.angle - quarterTurn * 2);

    const inXStart =
      centerX + halfSize * Math.cos(this.angle + quarterTurn * 2);
    const inYStart =
      centerY + halfSize * Math.sin(this.angle + quarterTurn * 2);

    if (showPath) {
      this.debugPath.center.push({ x: centerX, y: centerY });
      this.debugPath.outer.push({ x: extXStart, y: extYStart });
      this.debugPath.inner.push({ x: inXStart, y: inYStart });
    }

    for (let i = 0; i < this.moveDistance * 2; i++) {
      const centerPosX = centerX + baseSize * Math.cos(this.angle) * (i + 1);
      const centerPosY = centerY + baseSize * Math.sin(this.angle) * (i + 1);

      // exterior line

      const extPosX = extXStart + baseSize * Math.cos(this.angle) * (i + 1);
      const extPosY = extYStart + baseSize * Math.sin(this.angle) * (i + 1);

      // interior line

      const inPosX = inXStart + baseSize * Math.cos(this.angle) * (i + 1);
      const inPosY = inYStart + baseSize * Math.sin(this.angle) * (i + 1);

      if (showPath) {
        this.debugPath.center.push({ x: centerPosX, y: centerPosY });
        this.debugPath.outer.push({ x: extPosX, y: extPosY });
        this.debugPath.inner.push({ x: inPosX, y: inPosY });
      }

      const checkCenter = addPoint(centerPosX, centerPosY);
      const checkOuter = addPoint(extPosX, extPosY);
      const checkInner = addPoint(inPosX, inPosY);

      if (!checkCenter || !checkOuter || !checkInner) {
        if (showPath) {
          this.resetDebugPath();
        }
        return false;
      }
    }
    return path;
  }

  protected onMoveComplete(grid: TGrid, newX: number, newY: number): void {
    super.onMoveComplete(grid, newX, newY);
    this.progress = 0;
    this.tailProgress = 0;
  }
}
