import { useCallback, useEffect, useRef, useState } from "react";
import { Kinogrida } from "@amphore-dev/kinogrida";
import { DiamondShape } from "./classes/DiamondShape";
import { Modal } from "./components/Modal";
import { Key } from "./components/Key";
import { LevaControls } from "./components/LevaControls";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(
    import.meta.env.MODE !== "development"
  );

  const engineRef = useRef<Kinogrida | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);

  const canvasRefCallback = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const engine = new Kinogrida(canvas, {
      showMouseHighlight: true,
      customShapes: { diamond: DiamondShape },
    });
    engineRef.current = engine;
    engine.play();
    setIsEngineReady(true);

    return () => {
      engine.destroy();
      engineRef.current = null;
      setIsEngineReady(false);
    };
  }, []);

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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="App">
      {isEngineReady && (
        <LevaControls engineRef={engineRef} hidden={isModalOpen} />
      )}
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
        ref={canvasRefCallback}
        className="absolute inset-0 w-full h-full"
        style={{
          background: "black",
        }}
      />
    </div>
  );
}

export default App;
