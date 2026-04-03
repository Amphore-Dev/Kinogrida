# 🎨 Kinogrida

**A TypeScript library for creating animated shape visualizations on HTML5 Canvas**

Kinogrida provides a powerful and flexible system for creating animated grid-based visualizations with dynamic shape movements, collision detection, and customizable visual effects.

## ✨ Features

- 🎯 **Grid-based Animation System** - Smooth movement between grid cells with pathfinding
- 🔒 **Collision Detection** - Smart path locking prevents overlapping movements
- 🎨 **Multiple Shape Types** - BaseItem, RoundedShape, SquareShape with extensible architecture
- 🌈 **Rich Color Palettes** - 8 pre-built themes (Rainbow, Pastel, Neon, Ocean, Sunset, Dark, Earth, Cyberpunk)
- ⚡ **High Performance** - Optimized rendering with requestAnimationFrame
- 📱 **Responsive Design** - Auto-adapts to canvas resizing
- 🎛️ **Highly Customizable** - Extensive configuration options

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
const kinogrida = new Kinogrida(canvas);
kinogrida.play();

// Stop when needed
// kinogrida.pause();
```

## 🎨 Color Palettes

```typescript
import {
    CCOLORS_RAINBOW_PALETTE,
    CCOLORS_PASTEL_PALETTE,
    CCOLORS_NEON_PALETTE,
    CCOLORS_OCEAN_PALETTE,
    CCOLORS_SUNSET_PALETTE,
    CCOLORS_DARK_PALETTE,
    CCOLORS_EARTH_PALETTE,
    CCOLORS_CYBERPUNK_PALETTE,
} from "@amphore-dev/kinogrida";

// Use any palette for your shapes
const colors = CCOLORS_CYBERPUNK_PALETTE;
```

## 🔧 Advanced Usage

### Creating Custom Shapes

```typescript
import { BaseShape } from "@amphore-dev/kinogrida";

export class CustomShape extends BaseShape {
    public draw(context: CanvasRenderingContext2D, gridConfig: TGridConfig) {
        // Your custom drawing logic
        context.fillStyle = this.color;
        context.fillRect(x, y, width, height);
    }
}
```

### Grid Configuration

```typescript
const gridConfig = {
    nbrColumns: 20, // Number of columns
    nbrRows: 15, // Number of rows
    gridMargin: 50, // Margin around grid
    cellSize: 40, // Size of each cell (auto-calculated)
    lineWidth: 2, // Stroke width for shapes
};
```

### Movement System

The library features an intelligent movement system:

- **Path Planning** - Calculates optimal routes between grid positions
- **Cell Locking** - Reserves path cells to prevent collisions
- **Smooth Animation** - Fluid transitions with configurable speed
- **Bounce-free Motion** - Uses distance-based positioning for precise arrival

## 🏗️ Architecture

### Core Classes

- **`Kinogrida`** - Main orchestrator class managing canvas and animation
- **`BaseShape`** - Abstract base class for all animated shapes
- **`SquareShape`** - Square implementation with optional rounding

### Movement Lifecycle

1. **Path Generation** - Calculate cells between start and target
2. **Collision Check** - Verify path is clear of obstacles
3. **Cell Locking** - Reserve path cells to prevent conflicts
4. **Animation Phase 1** - Move shape head to target
5. **Animation Phase 2** - Move shape tail to complete extension
6. **Cleanup** - Release locked cells and update grid state

## 🎭 Shape Types

### BaseShape (Abstract)

BaseShape provides core properties and methods for all shapes, including color management and movement logic.

```typescript
// Abstract base class with color and movement capabilities
const item = new BaseShape(grid, x, y, color);
```

### SquareShape

SquareShape extends BaseShape to create squares with optional rounded corners. The `radiusPercent` option allows you to control the roundness of the corners.

```typescript
// Configurable squares with optional rounding
const square = new SquareShape(grid, x, y, {
    color: "blue",
    radiusPercent: 25, // 0-100 percentage
});
```

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
├── classes/          # Core shape classes
├── constants/        # Color palettes and constants
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
