import React, { useState, useRef } from "react";
import "./App.css";

const OBJECTS = [
  { name: "Stuffed Cat", volume: 300, color: "#2F3542", icon: "🐱" },
  { name: "Toy Horse", volume: 250, color: "#2F3542", icon: "🐴" },
  { name: "Soccer Ball", volume: 400, color: "#2F3542", icon: "⚽" },
  { name: "Banana", volume: 150, color: "#2F3542", icon: "🍌" },
  { name: "Cell Phone", volume: 120, color: "#2F3542", icon: "📱" },
  { name: "Apple", volume: 180, color: "#2F3542", icon: "🍎" },
  { name: "Shoe", volume: 350, color: "#2F3542", icon: "👟" },
];

const TANK_CAPACITY = 1000; // mL
const INITIAL_WATER_LEVEL = 500; // mL
const TANK_HEIGHT = 300; // px for SVG
const TANK_WIDTH = 120; // px for SVG
const DROP_START_Y = -40; // px above tank
const DROP_DURATION = 700; // ms

function App() {
  const [waterLevel, setWaterLevel] = useState(INITIAL_WATER_LEVEL);
  const [droppedObject, setDroppedObject] = useState(null);
  const [draggedObject, setDraggedObject] = useState(null);
  const [isOverTank, setIsOverTank] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [dropY, setDropY] = useState(DROP_START_Y);
  const [pendingObject, setPendingObject] = useState(null); // for animation
  const dropStartTime = useRef(null);
  const droppingObjectRef = useRef(null);

  // Calculate water fill height in SVG
  const waterFillHeight = (waterLevel / TANK_CAPACITY) * TANK_HEIGHT;

  // Calculate where the object should land (near the bottom of the tank)
  const getObjectTargetY = () => 10 + TANK_HEIGHT - 20; // 20px above the bottom

  // Measurement lines every 100 mL
  const marks = [];
  for (let i = 65; i <= TANK_CAPACITY; i += 100) {
    const y = TANK_HEIGHT - (i / TANK_CAPACITY) * TANK_HEIGHT + 50;
    marks.push(
      <g key={i}>
        <line
          x1={20}
          x2={TANK_WIDTH - 20}
          y1={y}
          y2={y}
          stroke="#333"
          strokeDasharray="2,2"
        />
        <text x={TANK_WIDTH} y={y + 4} fontSize="12" fill="#333">
          {i} mL
        </text>
      </g>
    );
  }

  // Animation loop for dropping
  const animateDrop = (timestamp) => {
    if (!dropStartTime.current) dropStartTime.current = timestamp;
    const elapsed = timestamp - dropStartTime.current;
    const targetY = getObjectTargetY();
    const startY = DROP_START_Y;
    const endY = targetY;
    const progress = Math.min(elapsed / DROP_DURATION, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentY = startY + (endY - startY) * eased;
    setDropY(currentY);

    // Use droppingObjectRef instead of pendingObject
    const obj = droppingObjectRef.current;

    if (progress < 1) {
      requestAnimationFrame(animateDrop);
    } else {
      setIsDropping(false);
      setDroppedObject(obj);
      setPendingObject(null);
      droppingObjectRef.current = null;
      if (obj) {
        setWaterLevel(
          Math.min(INITIAL_WATER_LEVEL + obj.volume, TANK_CAPACITY)
        );
      }
    }
  };

  const handleDragStart = (obj) => {
    setDraggedObject(obj);
  };

  const handleDragEnd = () => {
    setDraggedObject(null);
    setIsOverTank(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOverTank(true);
  };

  const handleDragLeave = () => {
    setIsOverTank(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedObject && !droppedObject && !isDropping) {
      droppingObjectRef.current = draggedObject;
      setPendingObject(draggedObject);
      setIsDropping(true);
      setDropY(DROP_START_Y);
      dropStartTime.current = null;
      requestAnimationFrame(animateDrop);
    }
    setDraggedObject(null);
    setIsOverTank(false);
  };

  const handleReset = () => {
    setWaterLevel(INITIAL_WATER_LEVEL);
    setDroppedObject(null);
    setDraggedObject(null);
    setIsOverTank(false);
    setIsDropping(false);
    setDropY(DROP_START_Y);
    setPendingObject(null);
    dropStartTime.current = null;
    droppingObjectRef.current = null;
  };

  // Render the object dropping or at rest
  const renderObjectInTank = () => {
    if (isDropping && pendingObject) {
      return (
        <text
          x={TANK_WIDTH / 2}
          y={dropY}
          fontSize="32"
          textAnchor="middle"
          style={{ filter: "drop-shadow(0 2px 2px #fff)", pointerEvents: "none" }}
        >
          {pendingObject.icon}
        </text>
      );
    }
    if (droppedObject) {
      return (
        <text
          x={TANK_WIDTH / 2}
          y={getObjectTargetY()}
          fontSize="32"
          textAnchor="middle"
          style={{ filter: "drop-shadow(0 2px 2px #fff)", pointerEvents: "none" }}
        >
          {droppedObject.icon}
        </text>
      );
    }
    return null;
  };

  return (
    <div className="App">
      <h1>Water Displacement Interactive</h1>
      <div className="instructions">
        <h3>Instructions:</h3>
        <ol>
          <li style={{ textAlign: "left" }}>Drag an object and drop it into the tank.</li>
          <li style={{ textAlign: "left" }}>The object will fall into the tank, then the water level will rise.</li>
          <li style={{ textAlign: "left" }}>Click <b>Reset</b> to try another object.</li>
        </ol>
      </div>
      <div className="scene">
        <div className="table">
          <div
            className={`tank-area${isOverTank ? " over" : ""}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
<svg
  width={TANK_WIDTH}
  height={TANK_HEIGHT + 50}
  className="tank-svg"
>
      {/* Bottom ellipse */}
      <ellipse
    cx={TANK_WIDTH / 2}
    cy={30 + TANK_HEIGHT}
    rx={(TANK_WIDTH - 5) / 2}
    ry={16}
    fill="#b0abf2"
    stroke="#333"
    strokeWidth={4}
  />
    {/* Water fill (rect for body) */}
    <rect
    x={10}
    y={30 + TANK_HEIGHT - waterFillHeight}
    width={TANK_WIDTH - 20}
    height={waterFillHeight}
    fill="url(#waterGradient)"
    rx={0}
    style={{ transition: "all 0.7s cubic-bezier(.4,2,.6,1)" }}
  />
{/* Water surface ellipse - matching top rim dimensions */}
{waterFillHeight > 0 && (
  <ellipse
    cx={TANK_WIDTH / 2}
    cy={30 + TANK_HEIGHT - waterFillHeight}
    rx={(TANK_WIDTH - 20) / 2}
    ry={16}
    fill="url(#waterGradient)"
    style={{ transition: "all 0.7s cubic-bezier(.4,2,.6,1)" }}
  />
)}

  {/* Beaker body */}
  <rect
    x={10}
    y={30}
    width={TANK_WIDTH - 20}
    height={TANK_HEIGHT}
    fill="none"
    stroke="#333"
    strokeWidth={3}
    rx={8}
  />

  {/* Top ellipse (beaker rim) */}
  <ellipse
    cx={TANK_WIDTH / 2}
    cy={30}
    rx={(TANK_WIDTH - 20) / 2}
    ry={16}
    fill="#bbb6f4"
    stroke="#333"
    strokeWidth={4}
  />
  {/* Glass reflection */}
  <rect
    x={15}
    y={35}
    width={12}
    height={TANK_HEIGHT - 10}
    fill="white"
    opacity="0.1"
    rx={4}
  />

  {/* Glass shine 
  <ellipse
    cx={TANK_WIDTH / 2 + 18}
    cy={TANK_HEIGHT / 2 + 30}
    rx={8}
    ry={TANK_HEIGHT / 2.2}
    fill="white"
    opacity="0.13"
  />*/}
  {/* Gradients */}
  <defs>
    <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#e0f7fa" />
      <stop offset="100%" stopColor="#b3e0ff" />
    </linearGradient>
    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#4fc3f7" />
      <stop offset="100%" stopColor="#1976d2" />
    </linearGradient>
  </defs>
  {/* Measurement marks and object */}
  {marks}
  {renderObjectInTank()}
</svg>
            <div className="water-label">
              Water Level: <b>{waterLevel} mL</b>
            </div>
          </div>
          <div className="object-list">
            <h2>Objects</h2>
            <div className="objects">
              {OBJECTS.map((obj) => (
                <div
                  key={obj.name}
                  className={`object${
                    (droppedObject && droppedObject.name === obj.name) || isDropping
                      ? " disabled"
                      : ""
                  }`}
                  draggable={!droppedObject && !isDropping}
                  onDragStart={() => handleDragStart(obj)}
                  onDragEnd={handleDragEnd}
                  style={{
                    background: obj.color,
                    opacity:
                      (droppedObject && droppedObject.name === obj.name) || isDropping
                        ? 0.4
                        : 1,
                    cursor: droppedObject || isDropping ? "not-allowed" : "grab",
                  }}
                  title={`Volume: ${obj.volume} mL`}
                >
                  <span className="object-icon" role="img" aria-label={obj.name}>
                    {obj.icon}
                  </span>
                  <span className="object-name">{obj.name}</span>
                  {/* <span className="object-volume">{obj.volume} mL</span> */}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button className="reset-btn" onClick={handleReset} disabled={isDropping}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default App; 