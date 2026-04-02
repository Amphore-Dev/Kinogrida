import { useEffect, useRef } from "react";
import { Kinogrida } from "@amphore-dev/kinogrida";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Kinogrida | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    // Initialize ShadesEngine with custom shape
    engineRef.current = new Kinogrida(canvasRef.current);

    engineRef.current.play();
    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, []);
  return (
    <div className="App">
      {/* Canvas */}
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
