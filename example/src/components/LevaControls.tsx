import { useEffect, useRef, useState, useCallback } from "react";
import {
  CDEFAULT_GRID_CONFIG,
  Kinogrida,
  SHAPES_TYPES,
} from "@amphore-dev/kinogrida";
import { button, folder, Leva, useControls } from "leva";

const STORAGE_KEY = "kinogrida-leva-controls";

function loadSavedControls(): Record<string, unknown> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const saved = loadSavedControls();

const initialColumns =
  (saved.nbrColumns as number) ?? Math.floor(window.innerWidth / 100);
const initialRows =
  (saved.nbrRows as number) ?? Math.floor(window.innerHeight / 100);

function useLevaControls() {
  return useControls({
    State: folder({
      isPlaying: (saved.isPlaying as boolean) ?? true,
      showMouseHighlight: (saved.showMouseHighlight as boolean) ?? true,
    }),
    "Shape Add": folder(
      {
        type: {
          value: (saved.type as string) ?? "square",
          options: [...Object.keys(SHAPES_TYPES), "diamond"],
        },
        radiusPercent: {
          value: (saved.radiusPercent as number) ?? 0,
          min: 0,
          max: 1,
          step: 0.01,
        },
        color: (saved.color as string) ?? "#ff0000",
      },
      { collapsed: false }
    ),
    Grid: folder(
      {
        speed: {
          value: (saved.speed as number) ?? CDEFAULT_GRID_CONFIG.speed,
          min: 100,
          max: 60000,
          step: 100,
        },
        fillPercentage: {
          value: (saved.fillPercentage as number) ?? 0.2,
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
        showAll: (saved.showAll as boolean) ?? false,
        showGrid: (saved.showGrid as boolean) ?? false,
        showStats: (saved.showStats as boolean) ?? false,
        showLockedCells: (saved.showLockedCells as boolean) ?? false,
        showPath: (saved.showPath as boolean) ?? false,
        showPosition: (saved.showPosition as boolean) ?? false,
      },
      { collapsed: true }
    ),
  });
}

function useLevaEffects(engineRef: React.RefObject<Kinogrida | null>) {
  const controls = useLevaControls();

  const [resetTrigger, setResetTrigger] = useState(0);
  useControls({
    "Reset grid": button(() => setResetTrigger((n) => n + 1)),
  });
  useEffect(() => {
    if (resetTrigger === 0) return;
    const engine = engineRef.current;
    if (!engine) return;
    engine.initGrid();
  }, [resetTrigger, engineRef]);
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
  } = controls;

  // Persist all control values to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
  }, [controls]);

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
    [engineRef]
  );

  useEffect(() => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current?.play();
    } else {
      engineRef.current?.pause();
    }
  }, [isPlaying, engineRef]);

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
  }, [
    showGrid,
    showStats,
    showLockedCells,
    showPath,
    showPosition,
    showAll,
    engineRef,
  ]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFillPercentage(fillPercentage);
    }
  }, [fillPercentage, engineRef]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSpeed(speed);
    }
  }, [speed, engineRef]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setConfig({
        showMouseHighlight,
      });
    }
  }, [showMouseHighlight, engineRef]);

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
  }, [nbrColumns, nbrRows, engineRef]);

  return { handleCellClick };
}

export function LevaControls({
  engineRef,
  hidden,
}: {
  engineRef: React.RefObject<Kinogrida | null>;
  hidden?: boolean;
}) {
  const { handleCellClick } = useLevaEffects(engineRef);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.on("cellClick", handleCellClick);
    return () => {
      engine.off("cellClick", handleCellClick);
    };
  }, [handleCellClick, engineRef]);

  return <Leva hidden={hidden} />;
}
