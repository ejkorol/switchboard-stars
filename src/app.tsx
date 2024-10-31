import { useEffect, useRef, useState } from "react";
import "./index.scss";

type State = "off" | "medium" | "high";

const App = () => {
  const rows = 5;
  const columns = 18;
  const transitionDuration = 250;

  // cherry picking the stars here
  const originalIndices = [0, 1, 2, 5, 8, 13, 21, 34, 55, 89];

  // the hovered message
  const hoverIndices = [
    0, 1, 2, 4, 5, 6, 9, 12, 13, 14, 17, 18, 23, 26, 28, 30, 32, 35, 36, 37, 38,
    41, 44, 45, 46, 48, 49, 53,
  ];

  // states of the stars
  const states: State[] = ["off", "medium", "high"];

  const switchboardRef = useRef<HTMLDivElement | null>(null);

  const getRandomNumber = (max: number, min: number) => {
    return Math.abs(Math.random() * (max - min + 1)) + min;
  };

  const [isHover, setIsHover] = useState<boolean>(false);

  useEffect(() => {
    const timeoutIds: number[] = [];

    const interval = setInterval(() => {
      originalIndices.forEach((index) => {
        const light = switchboardRef.current?.querySelector(
          `[data-index="${index}"]`,
        ) as HTMLDivElement;

        if (!light) {
          return;
        }

        // Pick a random next state
        const nextState = states[Math.floor(Math.random() * states.length)];
        const currentState = light.dataset.state;

        const pulse =
          Math.random() > 0.2 &&
          // "off" -> "medium" -> "high"
          ((currentState === "off" && nextState === "high") ||
            (currentState === "off" && nextState === "medium") ||
            (currentState === "medium" && nextState === "high"));

        if (pulse) {
          const delay = getRandomNumber(100, 500);

          timeoutIds.push(
            setTimeout(() => {
              light.style.transform = "scale(2)";
            }, delay),
          );

          timeoutIds.push(
            setTimeout(() => {
              light.style.transform = "scale(1)";
            }, transitionDuration + delay),
          );
        }

        // post pulse don't transition from "high" -> "medium"
        if (currentState === "high" && nextState === "medium" && pulse) {
          light.dataset.state = "off";
        } else {
          light.dataset.state = nextState;
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  return (
    <main className="main">
      {/* switchboard */}
      <div
        ref={switchboardRef}
        className="switchboard"
        style={{
          display: "grid",
          gap: `${columns}px`,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        }}
        onMouseEnter={(_e) => setIsHover(true)}
        onMouseLeave={(_e) => setIsHover(false)}
      >
        {Array.from({ length: columns * rows }).map((_, i) => {
          // Determine the current state of the light
          const isLightOn = isHover
            ? hoverIndices.includes(i)
            : originalIndices.includes(i); // Use hover indices when hovered

          return (
            <div
              key={i}
              className="light"
              data-state={isLightOn ? "high" : "off"}
              data-index={i}
              style={
                {
                  "--transition-duration": `${transitionDuration}ms`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>
    </main>
  );
};

export default App;
