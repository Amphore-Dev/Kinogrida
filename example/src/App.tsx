import { useCallback, useEffect, useRef, useState } from "react";
import {
  CDEFAULT_GRID_CONFIG,
  Kinogrida,
  SHAPES_TYPES,
} from "@amphore-dev/kinogrida";
import { Modal } from "./components/Modal";
import { Key } from "./components/Key";
import { folder, useControls } from "leva";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(
    import.meta.env.MODE !== "development"
  );

  const initialColumns = Math.floor(window.innerWidth / 100);
  const initialRows = Math.floor(window.innerHeight / 100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Kinogrida | null>(null);

  const {
    isPlaying,
    radiusPercent,
    fillPercentage,
    color,
    type,
    showGrid,
    showStats,
    showLockedCells,
    showPath,
    showPosition,
    showAll,
    speed,
    nbrColumns,
    nbrRows,
    showMouseHighlight,
  } = useControls({
    State: folder({
      isPlaying: true,
      showMouseHighlight: true,
    }),
    "Shape Add": folder(
      {
        type: { value: "square", options: Object.keys(SHAPES_TYPES) },
        radiusPercent: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
        },
        color: "#ff0000",
      },
      { collapsed: false }
    ),
    Grid: folder(
      {
        speed: {
          value: CDEFAULT_GRID_CONFIG.speed,
          min: 100,
          max: 60000,
          step: 100,
        },
        fillPercentage: {
          value: 0.2,
          min: 0.01,
          max: 1,
          step: 0.01,
        },
        size: folder({
          nbrColumns: {
            value: initialColumns,
            min: 1,
            max: 100,
            step: 1,
          },
          nbrRows: {
            value: initialRows,
            min: 1,
            max: 100,
            step: 1,
          },
        }),
      },
      {
        collapsed: false,
      }
    ),

    Debug: folder(
      {
        showAll: false,
        showGrid: false,
        showStats: false,
        showLockedCells: false,
        showPath: false,
        showPosition: false,
      },
      { collapsed: true }
    ),
  });

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === "f") {
      toggleFullScreen();
    } else if (key === "d" && e.shiftKey) {
      engineRef.current?.toggleDebugMode();
    }
  }, []);

  const shapeConfigRef = useRef({ color, type, radiusPercent });
  useEffect(() => {
    shapeConfigRef.current = { color, type, radiusPercent };
  }, [color, type, radiusPercent]);

  const handleCellClick = useCallback(
    (x: number, y: number, isValid: boolean) => {
      if (!engineRef.current || !isValid) return;

      const { color, type, radiusPercent } = shapeConfigRef.current;
      engineRef.current.addCell(type, x, y, {
        color,
        radiusPercent: radiusPercent / 2,
      });
    },
    []
  );

  useEffect(() => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current?.play();
    } else {
      engineRef.current?.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.toggleDebugMode(
        showAll
          ? true
          : {
              showGrid,
              showStats,
              showLockedCells,
              showPath,
              showPosition,
            }
      );
    }
  }, [showGrid, showStats, showLockedCells, showPath, showPosition, showAll]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFillPercentage(fillPercentage);
    }
  }, [fillPercentage]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSpeed(speed);
    }
  }, [speed]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setConfig({
        showMouseHighlight,
      });
    }
  }, [showMouseHighlight]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setConfig(
        {
          nbrColumns,
          nbrRows,
        },
        true
      );
    }
  }, [nbrColumns, nbrRows]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    // Initialize ShadesEngine with custom shape
    engineRef.current = new Kinogrida(canvasRef.current, {
      showMouseHighlight: true,
    });

    engineRef.current.on("cellClick", handleCellClick);
    engineRef.current.play();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [handleCellClick]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className="App">
      {/* Canvas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="text-neutral-200"
        title="Kinogrida"
        titleClassName="font-neon text-[3rem] sm:text-[4rem] lg:text-[6rem] duration-300"
      >
        <p className="text-lg max-w-xl">
          Kinogrida is a canvas-based animation engine that creates a dynamic
          grid of shapes that evolve over time, forming intricate patterns and
          designs.
        </p>
        <table className="border-separate border-spacing-x-4 border-spacing-y-4">
          <tbody>
            <tr>
              <td className="justify-items-right">
                <Key value="Click" square={false} />
              </td>
              <td className="text-left">Add a cell</td>
            </tr>
            <tr>
              <td className="justify-items-right ">
                <Key value="F" />
              </td>
              <td className="text-left">Toggle full screen</td>
            </tr>
          </tbody>
        </table>
      </Modal>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: "black",
        }}
      />
    </div>
  );
}

export default App;
