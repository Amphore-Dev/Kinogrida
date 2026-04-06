# 🎨 Kinogrida

**A TypeScript library for creating animated shape visualizations on HTML5 Canvas**

Kinogrida provides a powerful and flexible system for creating animated grid-based visualizations with dynamic shape movements, collision detection, and customizable visual effects.

## ✨ Features

- 🎯 **Grid-based Animation System** - Smooth movement between grid cells with pathfinding
- 🔒 **Collision Detection** - Smart path locking prevents overlapping movements
- 🎨 **Multiple Shape Types** - SquareShape (rounded or not), ArcShape, and extensible architecture for custom shapes
- 🌈 **Rich Color Palettes** - 8 pre-built themes (Rainbow, Pastel, Neon, Ocean, Sunset, Dark, Earth, Cyberpunk)
- 🔄 **Advanced Arc Animation** - Clockwise/counterclockwise rotation with configurable amplitude
- ⚡ **High Performance** - Frame-independent animation with requestAnimationFrame
- 📱 **Responsive Design** - Auto-adapts to canvas resizing
- 🎛️ **Highly Customizable** - Extensive configuration options
- 📡 **Event System** - Typed event emitter (`on`/`off`) for `cellClick`, `moveStart`, `move`, `moveEnd`
- 🐛 **Granular Debug** - Individual toggles for grid, stats, locked cells, paths, and positions

## 🚀 Installation

```bash
npm install @amphore-dev/kinogrida
```

## 📖 Quick Start

```typescript
import { Kinogrida } from "@amphore-dev/kinogrida";

// Get your canvas element
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

// Create and start the visualization
const kinogrida = new Kinogrida(canvas, {
    speed: 2000, // Animation duration in ms (grow + shrink)
});
kinogrida.play();

// Stop when needed
// kinogrida.pause();
// kinogrida.destroy();
```

## 🎛️ Configuration

### Engine Options

```typescript
const kinogrida = new Kinogrida(canvas, {
    nbrColumns: 20, // Number of columns
    nbrRows: 15, // Number of rows
    gridMargin: 50, // Margin around grid (px)
    lineWidth: 2, // Stroke width for shapes
    speed: 4000, // Total animation duration in ms (grow + shrink)
    showMouseHighlight: true, // Highlight cell on hover
    debug: false, // Debug mode (boolean or TDebugOptions)
});
```

### Speed

`speed` is the total duration of a single move animation in milliseconds, covering both the grow phase (head moves to target) and the shrink phase (tail catches up). Lower values = faster movement.

```typescript
kinogrida.setSpeed(1000); // Fast (1s per move)
kinogrida.setSpeed(4000); // Default (4s per move)
kinogrida.setSpeed(10000); // Slow (10s per move)

kinogrida.getSpeed(); // Current speed in ms
```

### Debug Options

Debug can be a simple boolean (`true` enables all) or a granular `TDebugOptions` object:

```typescript
import { TDebugOptions } from "@amphore-dev/kinogrida";

// Enable all debug overlays
kinogrida.toggleDebugMode(true);

// Granular control
kinogrida.toggleDebugMode({
    showGrid: true, // Draw grid lines
    showStats: true, // FPS, cell count, grid size overlay
    showLockedCells: true, // Highlight locked cells during movement
    showPath: true, // Draw arc debug paths
    showPosition: false, // Show (x,y) coordinates on cells
});

// Toggle all on/off
kinogrida.toggleDebugMode();
```

## 📡 Events

Kinogrida exposes a typed event emitter:

```typescript
// Cell click
kinogrida.on("cellClick", (x, y, isValid) => {
    if (isValid) {
        kinogrida.addCell("arc", x, y, { color: "#ff0000" });
    }
});

// Movement lifecycle
kinogrida.on("moveStart", (shape, fromX, fromY, toX, toY) => {
    /* ... */
});
kinogrida.on("move", (shape, x, y) => {
    /* ... */
});
kinogrida.on("moveEnd", (shape, x, y) => {
    /* ... */
});

// Unsubscribe
kinogrida.off("cellClick", myHandler);
```

## 🎨 Color Palettes

```typescript
import {
    CCOLORS_OCEAN_PALETTE,
    CCOLORS_SUNSET_PALETTE,
    CCOLORS_DARK_PALETTE,
    CCOLORS_CYBERPUNK_PALETTE,
    CCOLORS_MONOCHROME_PALETTE,
    CWATERMELON_PALETTE,
} from "@amphore-dev/kinogrida";

// Use any palette for your shapes
const colors = CWATERMELON_PALETTE;
```

## 🔧 API Reference

### Kinogrida

| Method                         | Description                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| `play()`                       | Start the animation loop                                      |
| `pause()`                      | Pause the animation loop                                      |
| `destroy()`                    | Stop and clean up all resources                               |
| `addCell(type, x, y, config?)` | Add a shape (`"square"`, `"arc"`, or custom) at grid position |
| `clearGrid()`                  | Remove all cells                                              |
| `initGrid(config?)`            | Reinitialize the grid                                         |
| `fillGridRandomly()`           | Fill the grid with random shapes                              |
| `setConfig(config, reset?)`    | Update grid config; pass `reset: true` to reinitialize        |
| `getConfig()`                  | Get current grid config                                       |
| `setSpeed(ms)`                 | Set animation duration in ms                                  |
| `getSpeed()`                   | Get current animation duration                                |
| `setFillPercentage(pct)`       | Set fill density (0–1) and reinitialize                       |
| `getFillPercentage()`          | Get current fill density                                      |
| `toggleDebugMode(value?)`      | Toggle or set debug options                                   |
| `getCurrentFPS()`              | Current measured FPS                                          |
| `getDeltaTime()`               | Last frame delta in ms                                        |
| `on(event, handler)`           | Subscribe to an event                                         |
| `off(event, handler)`          | Unsubscribe from an event                                     |

## 🎭 Shape Types

### SquareShape

Square with optional rounded corners, moves in straight lines (horizontal/vertical).

```typescript
kinogrida.addCell("square", x, y, {
    color: "#3498db",
    radiusPercent: 0.5, // 0 = sharp, 1 = fully rounded
});
```

### ArcShape

Curved arc with rotation control, moves along circular paths.

```typescript
kinogrida.addCell("arc", x, y, {
    color: "#e74c3c",
    clockwise: true, // Rotation direction
    rotationAmount: 0.25, // 0.25=90°, 0.5=180°, 0.75=270°, 1.0=360°
});
```

## 🧩 Custom Shapes

You can create your own shape classes by extending `BaseShape` and passing them to the engine via the `customShapes` option.

### Creating a Custom Shape

Extend `BaseShape` and implement the three required abstract methods:

```typescript
import {
    BaseShape,
    TGrid,
    TGridConfig,
    TShapeConfig,
} from "@amphore-dev/kinogrida";

export class DiamondShape extends BaseShape {
    protected angle: number = 0;
    protected moveDistance: number = 0;

    constructor(grid: TGrid, x: number, y: number, options: TShapeConfig) {
        super(grid, x, y, options);
        this.angle = Math.PI / 4; // 45° diagonal
        this.moveDistance = 3;
    }

    // Required: render the shape on canvas
    draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig): void {
        const { cellSize, offsetX, offsetY, lineWidth } = gridConfig;
        const centerX = this.x * cellSize + cellSize / 2 + offsetX;
        const centerY = this.y * cellSize + cellSize / 2 + offsetY;
        const half = cellSize * 0.4;

        context.lineWidth = lineWidth;
        context.strokeStyle = this.color;
        context.beginPath();
        context.moveTo(centerX, centerY - half);
        context.lineTo(centerX + half, centerY);
        context.lineTo(centerX, centerY + half);
        context.lineTo(centerX - half, centerY);
        context.closePath();
        context.stroke();
    }

    // Required: decide where to move next
    protected calculateNewTarget(grid: TGrid, gridConfig: TGridConfig): void {
        const targetX =
            this.x + Math.round(this.moveDistance * Math.cos(this.angle));
        const targetY =
            this.y + Math.round(this.moveDistance * Math.sin(this.angle));
        this.moveTo(grid, gridConfig, targetX, targetY);
    }

    // Required: animate position using this.progress / this.tailProgress
    protected updatePosition(grid: TGrid): void {
        const step = this.speed * this.moveDistance;

        if (this.hasReachedTarget) {
            this.tailProgress = Math.min(
                this.tailProgress + step,
                this.moveDistance,
            );
            if (this.tailProgress === this.moveDistance) {
                this.onMoveComplete(grid, this.targetX, this.targetY);
            }
        } else {
            this.progress = Math.min(this.progress + step, this.moveDistance);
            if (this.progress === this.moveDistance) {
                this.hasReachedTarget = true;
            }
        }
    }
}
```

### Registering Custom Shapes

Pass your custom shape classes in the `customShapes` option when creating the engine:

```typescript
import { Kinogrida } from "@amphore-dev/kinogrida";
import { DiamondShape } from "./shapes/DiamondShape";

const kinogrida = new Kinogrida(canvas, {
    speed: 2000,
    customShapes: {
        diamond: DiamondShape,
    },
});
kinogrida.play();

// Now you can use your custom shape type
kinogrida.addCell("diamond", 5, 5, { color: "#9b59b6" });
```

Custom shapes are merged with built-in shapes (`"square"`, `"arc"`) and can be used anywhere a shape type is expected, including `fillGridRandomly()`.

### Abstract Methods Reference

| Method                                 | Description                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `draw(context, gridConfig)`            | Render the shape. Use `this.x`, `this.y`, `this.progress`, and `this.tailProgress` for animated positioning.              |
| `calculateNewTarget(grid, gridConfig)` | Choose a target cell and call `this.moveTo(grid, gridConfig, targetX, targetY)`.                                          |
| `updatePosition(grid)`                 | Advance `this.progress` (head) and `this.tailProgress` (tail) using `this.speed`. Call `this.onMoveComplete()` when done. |

### Useful Inherited Properties

| Property                        | Type      | Description                                            |
| ------------------------------- | --------- | ------------------------------------------------------ |
| `this.x` / `this.y`             | `number`  | Current grid position                                  |
| `this.targetX` / `this.targetY` | `number`  | Movement target position                               |
| `this.progress`                 | `number`  | Head progress (0 → moveDistance)                       |
| `this.tailProgress`             | `number`  | Tail progress (0 → moveDistance, starts after head)    |
| `this.speed`                    | `number`  | Per-frame increment (computed from `gridConfig.speed`) |
| `this.color`                    | `string`  | Shape color from config                                |
| `this.isMoving`                 | `boolean` | Whether the shape is currently animating               |
| `this.hasReachedTarget`         | `boolean` | Whether the head has reached the target                |

## 🏗️ Architecture

### Core Classes

- **`Kinogrida`** - Main orchestrator class managing canvas, animation loop, and events
- **`BaseShape`** - Abstract base class for all animated shapes
- **`SquareShape`** - Square implementation with optional rounded corners
- **`ArcShape`** - Curved arc implementation with rotation and directional control

### Movement Lifecycle

1. **Path Generation** - Calculate cells between start and target
2. **Collision Check** - Verify path is clear of obstacles
3. **Cell Locking** - Reserve path cells to prevent conflicts
4. **Grow Phase** - Move shape head to target (duration: `speed / 2`)
5. **Shrink Phase** - Move shape tail to target (duration: `speed / 2`)
6. **Cleanup** - Release locked cells and update grid state

## 📚 Development

### Build & Test

```bash
# Development build with watch
npm run build:watch

# Run tests
npm test

# Run example
cd example && npm run dev
```

### Project Structure

```
src/
├── classes/          # Core shape classes (Kinogrida, BaseShape, SquareShape, ArcShape)
├── constants/        # Color palettes and default config
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (math, colors, shapes)
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
