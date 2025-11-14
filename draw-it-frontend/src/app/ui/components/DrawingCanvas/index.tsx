"use client";

import { useRef, useState, useEffect } from "react";
import { Box, Button, Alert } from "@mui/material";

interface DrawingCanvasProps {
  selectedWord: string;
  onSubmit: (imageData: string) => void;
  timeLimit: number;
}

export default function DrawingCanvas({
  selectedWord,
  onSubmit,
  timeLimit,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    onSubmit(imageData);
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Alert severity='info' sx={{ mb: 2 }}>
        Draw: {selectedWord} | Time: {timeLeft}s
      </Alert>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: "2px solid #000",
          cursor: "crosshair",
          touchAction: "none",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant='outlined' onClick={clearCanvas}>
          Clear
        </Button>
        <Button variant='contained' onClick={handleSubmit}>
          Submit Drawing
        </Button>
      </Box>
    </Box>
  );
}
