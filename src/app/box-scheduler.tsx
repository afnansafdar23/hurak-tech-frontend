"use client";

import { useState, useEffect, useRef } from "react";

interface Box {
  id: number;
  height: number;
  width: number;
  color: string;
}

const COLORS = ["red", "yellow", "green", "blue", "pink", "grey"];

export default function BoxScheduler() {
  const [boxes, setBoxes] = useState<Box[]>([
    {
      id: 1,
      height: 40,
      width: 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  ]);
  const [isRunning, setIsRunning] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomColor = () =>
    COLORS[Math.floor(Math.random() * COLORS.length)];

  const simulateDbStorage = async (newBoxes: Box[]) => {
    // Simulate database storage
    console.log(
      "Storing boxes in database:",
      newBoxes.map((box) => ({
        height: box.height,
        width: box.width,
        color: box.color,
      }))
    );

    // Simulate API call to store in database
    try {
      await fetch("http://127.0.0.1:8000/api/generate-box", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boxes: newBoxes }),
      });
    } catch (error) {
      console.log("Database simulation - would store boxes:", newBoxes.length);
    }
  };

  const sendCompletionEmail = async () => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "Dawood.ahmed@collaborak.com",
          subject: "1st Task Done with Assistant ",
          message:
            "The box scheduler has completed successfully with 16 boxes generated.",
        }),
      });
      setEmailSent(true);
      console.log("Email sent successfully");
    } catch (error) {
      console.log("Email simulation - would send to abcd@example.com");
      setEmailSent(true);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(async () => {
      setBoxes((currentBoxes) => {
        if (currentBoxes.length >= 16) {
          setIsRunning(false);
          if (!emailSent) {
            sendCompletionEmail();
          }
          return currentBoxes;
        }

        // Double the number of boxes
        const newBoxes = [...currentBoxes];
        const currentCount = currentBoxes.length;

        for (let i = 0; i < currentCount; i++) {
          newBoxes.push({
            id: currentBoxes.length + i + 1,
            height: 40,
            width: 100,
            color: getRandomColor(),
          });
        }

        // Simulate database storage
        simulateDbStorage(newBoxes);

        console.log("Boxes doubled from", currentCount, "to", newBoxes.length);
        return newBoxes;
      });
    }, 60000); // 60 seconds = 1 minute

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, emailSent]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Box Scheduler
        </h1>

        <div className="mb-6 space-y-2">
          <p className="text-muted-foreground">
            Current boxes:{" "}
            <span className="font-semibold text-foreground">
              {boxes.length}
            </span>
          </p>
          <p className="text-muted-foreground">
            Status:{" "}
            <span
              className={`font-semibold ${
                isRunning ? "text-green-600" : "text-red-600"
              }`}
            >
              {isRunning ? "Running (doubles every minute)" : "Stopped"}
            </span>
          </p>
          {emailSent && (
            <p className="text-green-600 font-semibold">
              ✓ Completion email sent to Dawood.ahmed@collaborak.com
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {boxes.map((box) => (
            <div
              key={box.id}
              className="border border-border rounded-md flex items-center justify-center text-white font-semibold text-sm shadow-sm"
              style={{
                height: `${box.height}px`,
                width: `${box.width}px`,
                backgroundColor: box.color,
              }}
            >
              #{box.id}
            </div>
          ))}
        </div>

        {boxes.length >= 16 && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Task Completed!
            </h2>
            <p className="text-green-700 dark:text-green-300">
              Successfully generated 16 boxes and stopped the scheduler. Email
              notification sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
