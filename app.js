const { useState, useRef } = React;

function Web() {
  const containerRef = useRef();
  const [started, setStarted] = useState(false);

  const startSketch = () => {
    if (!started) {
      // web() is defined in sketch.js
      new p5(web, containerRef.current);
      setStarted(true); // remove button
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            className="px-8 py-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            onClick={startSketch}
          >
            Enter the web
          </button>
        </div>
      )}{" "}
      <div
        ref={containerRef}
        className="w-full h-full flex justify-center items-center"
      ></div>
    </div>
  );
}

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <Web />
      <p></p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
