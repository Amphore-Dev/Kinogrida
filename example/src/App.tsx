import { useCallback, useEffect, useRef, useState } from "react";
import { Kinogrida } from "@amphore-dev/kinogrida";
import { Modal } from "./components/Modal";
import { Key } from "./components/Key";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Kinogrida | null>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (key === "f") {
      toggleFullScreen();
    } else if (key === "d" && e.shiftKey) {
      engineRef.current?.toggleDebugMode();
    }
  };

  const initGrid = () => {
    engineRef.current?.initGrid();
  };

  const handeScroll = useCallback(
    (e: WheelEvent) => {
      let newFillPercentage;

      if (isModalOpen || !engineRef.current) return;

      if (e.deltaY < 0) {
        newFillPercentage = Math.min(
          1,
          engineRef.current?.getFillPercentage() + 0.005
        );
      } else {
        newFillPercentage = Math.max(
          0,
          engineRef.current?.getFillPercentage() - 0.005
        );
      }

      newFillPercentage = Math.max(0.01, newFillPercentage);
      if (newFillPercentage !== engineRef.current?.getFillPercentage()) {
        engineRef.current?.setFillPercentage(newFillPercentage);
      }
    },
    [isModalOpen, engineRef]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    // Initialize ShadesEngine with custom shape
    const engine = new Kinogrida(canvasRef.current);

    engineRef.current = engine;

    engine.play();

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", initGrid);
    window.addEventListener("wheel", handeScroll);
    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", initGrid);
      window.removeEventListener("wheel", handeScroll);
    };
  }, [handeScroll, isModalOpen, engineRef, handleKeyDown]);
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
              <td className="text-left">Reset grid / Change color</td>
            </tr>
            <tr>
              <td className="justify-items-right">
                <Key value="Wheel" square={false} />
              </td>
              <td className="text-left">
                Increase/Decrease the amount of shapes
              </td>
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
