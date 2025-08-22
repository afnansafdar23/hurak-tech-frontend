"use client";

import { useState, useEffect, useCallback } from "react";
import "./App.css";

interface Box {
  id: number;
  height: number;
  width: number;
  color: string;
  createdAt: Date;
}

const COLORS = ["red", "yellow", "green", "blue", "pink", "grey"];
const SCHEDULER_INTERVAL = 60000; // 1 minute in milliseconds
const MAX_BOXES = 16;

function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
  const [schedulerCount, setSchedulerCount] = useState(0);
  const [colorArray, setColorArray] = useState<string[]>([...COLORS]);

  const saveBoxesToDB = useCallback((boxesToSave: Box[]) => {
    boxesToSave.forEach((box) => {
      console.log(
        ` INSERT INTO boxes (height, width, color, created_at) VALUES (${
          box.height
        }, ${box.width}, '${box.color}', '${box.createdAt.toISOString()}')`
      );
    });
    localStorage.setItem("boxes", JSON.stringify(boxesToSave));
  }, []);

  const sendCompletionEmail = useCallback(() => {
    console.log(" Sending email to Dawood.ahmed@collaborak.com");
    console.log(" Subject: 1st Task Done ");
    console.log(" Email sent successfully (simulated)");
    alert(
      "Task completed! Email sent to Dawood.ahmed@collaborak.com\nSubject: 1st Task Done "
    );
  }, []);

  const getRandomColor = useCallback(() => {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }, []);

  useEffect(() => {
    if (boxes.length === 0) {
      const initialBox: Box = {
        id: 1,
        height: 40,
        width: 100,
        color: getRandomColor(),
        createdAt: new Date(),
      };
      setBoxes([initialBox]);
      saveBoxesToDB([initialBox]);
    }
  }, [boxes.length, getRandomColor, saveBoxesToDB]);

  const startScheduler = useCallback(() => {
    setIsSchedulerRunning(true);
    console.log(" Scheduler started - will run every minute");
  }, []);

  const stopScheduler = useCallback(() => {
    setIsSchedulerRunning(false);
    console.log(" Scheduler stopped");
  }, []);

  const doubleBoxes = useCallback(() => {
    setBoxes((currentBoxes) => {
      if (currentBoxes.length >= MAX_BOXES) {
        return currentBoxes;
      }

      const newBoxes: Box[] = [];
      const currentCount = currentBoxes.length;

      for (let i = 0; i < currentCount; i++) {
        const newBox: Box = {
          id: currentBoxes.length + newBoxes.length + 1,
          height: 40,
          width: 100,
          color: getRandomColor(),
          createdAt: new Date(),
        };
        newBoxes.push(newBox);
      }

      const allBoxes = [...currentBoxes, ...newBoxes];
      console.log(` Doubled boxes from ${currentCount} to ${allBoxes.length}`);

      saveBoxesToDB(allBoxes);

      return allBoxes;
    });

    setSchedulerCount((prev) => prev + 1);
  }, [getRandomColor, saveBoxesToDB]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isSchedulerRunning && boxes.length < MAX_BOXES) {
      intervalId = setInterval(() => {
        // console.log(" Scheduler tick - doubling boxes");
        doubleBoxes();
      }, SCHEDULER_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSchedulerRunning, boxes.length, doubleBoxes]);

  useEffect(() => {
    if (boxes.length >= MAX_BOXES && isSchedulerRunning) {
      stopScheduler();
      sendCompletionEmail();
    }
  }, [boxes.length, isSchedulerRunning, stopScheduler, sendCompletionEmail]);

  const shuffleColors = useCallback(() => {
    const shuffled = [...colorArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setColorArray(shuffled);

    setBoxes((currentBoxes) => {
      const shuffledBoxes = currentBoxes.map((box) => ({
        ...box,
        color: shuffled[Math.floor(Math.random() * shuffled.length)],
      }));
      // console.log(" Box colors shuffled at runtime");
      saveBoxesToDB(shuffledBoxes);
      return shuffledBoxes;
    });

    console.log(" Colors shuffled:", shuffled);
  }, [colorArray, saveBoxesToDB]);

  const sortBoxes = useCallback(() => {
    setBoxes((currentBoxes) => {
      const sortedBoxes = [...currentBoxes].sort((a, b) => {
        const aIndex = colorArray.indexOf(a.color);
        const bIndex = colorArray.indexOf(b.color);
        // Handle colors not in array by putting them at the end
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      console.log(" Boxes sorted according to color array order at runtime");
      saveBoxesToDB(sortedBoxes);
      return sortedBoxes;
    });
  }, [colorArray, saveBoxesToDB]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Box Scheduler</h1>
        <div className="scheduler-controls">
          <div className="status">
            <p>Total Boxes: {boxes.length}</p>
            <p>Scheduler Runs: {schedulerCount}</p>
            <p>Status: {isSchedulerRunning ? "Running" : "Stopped"}</p>
            {boxes.length >= MAX_BOXES && (
              <p className="completion-message">
                ✅ Task Completed! Email sent.
              </p>
            )}
          </div>

          <div className="controls">
            {!isSchedulerRunning && boxes.length < MAX_BOXES && (
              <button onClick={startScheduler} className="start-btn">
                Start Scheduler
              </button>
            )}
            {isSchedulerRunning && (
              <button onClick={stopScheduler} className="stop-btn">
                Stop Scheduler
              </button>
            )}
          </div>
        </div>
        <div className="top-section">
          <div className="color-array-display">{colorArray.join(", ")}</div>
          <button onClick={shuffleColors} className="shuffle-btn">
            Shuffle Colors
          </button>
          <button
            onClick={sortBoxes}
            className="sort-btn"
            disabled={boxes.length === 0}
          >
            Sort Boxes
          </button>
        </div>

        <div className="main-content">
          <div className="boxes-column">
            {boxes.map((box) => (
              <div
                key={box.id}
                className="color-box"
                style={{
                  backgroundColor: box.color,
                  height: `${box.height}px`,
                  width: `${box.width}px`,
                }}
              />
            ))}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
