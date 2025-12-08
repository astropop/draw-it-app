"use client";

import DrawIcon from "@mui/icons-material/Draw";
import WashIcon from "@mui/icons-material/Wash";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Slider,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  handleSubmitDrawing?: (imageData: string) => Promise<void>;
  onDrawingUpdate?: (imageData: string) => void;
}

interface Coordinates {
  x: number;
  y: number;
}

type ToolType = "pen" | "eraser";

export default function DrawingCanvas({
  handleSubmitDrawing,
  onDrawingUpdate,
}: DrawingCanvasProps) {
  /*
   * constants
   */
  /*
   * State management
   */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasImageRef = useRef<string>("");
  const [isDrawing, setIsDrawing] = useState(false);

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPos, setLastPos] = useState<Coordinates>({ x: 0, y: 0 });

  const [tool, setTool] = useState<ToolType>("pen");

  // brush
  const [brushColor, setBrushColor] = useState<string>("#1976d2");

  // brush and eraser size
  const [penSize, setPenSize] = useState<number>(4);
  const [eraserSize, setEraserSize] = useState<number>(20);

  /*
   * functions
   */
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): Coordinates => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    // mouse or touching
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      return { x: 0, y: 0 };
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !context || !canvasRef.current) return;

    const { x, y } = getCoordinates(e);

    const canvas = canvasRef.current;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Chọn kích thước dựa trên công cụ
    const currentSize = tool === "eraser" ? eraserSize : penSize;
    context.lineWidth = currentSize;
    context.strokeStyle = tool === "eraser" ? "#ffffff" : brushColor;

    // Vẽ đường cong Bézier để có nét mượt mà
    // Điểm điều khiển là điểm giữa giữa vị trí cũ và vị trí mới
    const controlX = (lastPos.x + x) / 2;
    const controlY = (lastPos.y + y) / 2;

    context.beginPath();
    context.moveTo(lastPos.x, lastPos.y);
    context.quadraticCurveTo(controlX, controlY, x, y);
    context.stroke();

    setLastPos({ x, y });

    // Update parent with current drawing data on every stroke
    if (onDrawingUpdate) {
      const imageData = canvas.toDataURL("image/png");
      onDrawingUpdate(imageData);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    context.clearRect(0, 0, width, height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    console.log("drawing data", imageData);

    // Call submit if handler exists
    if (handleSubmitDrawing) {
      handleSubmitDrawing(imageData);
    }
  };

  /*
   * Hooks area
   */
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setContext(ctx);

      // Restore previous drawing if exists
      if (canvasImageRef.current) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = canvasImageRef.current;
      }
    }
  };

  useEffect(() => {
    initializeCanvas();

    // Lắng nghe sự kiện resize
    const handleResize = () => {
      initializeCanvas();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (onDrawingUpdate && canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png");
      canvasImageRef.current = imageData;
      onDrawingUpdate(imageData);
    }
  }, [onDrawingUpdate]);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: "column",
          }}
        >
          <Typography variant='h5'>Tools</Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              sx={{
                textTransform: "none",
                opacity: `${tool === "eraser" ? 0.5 : 1}`,
              }}
              variant='contained'
              component='label'
              onClick={() => setTool("pen")}
              startIcon={<DrawIcon />}
            >
              Pen
            </Button>

            <Button
              sx={{
                textTransform: "none",
                opacity: `${tool === "pen" ? 0.5 : 1}`,
              }}
              variant='outlined'
              component='label'
              onClick={() => setTool("eraser")}
              startIcon={<WashIcon />}
            >
              Eraser
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Box
              sx={{
                opacity: `${tool === "eraser" ? 0.5 : 1}`,
              }}
            >
              <Typography gutterBottom>Pen size</Typography>
              <Slider
                onChange={(event, value) => setPenSize(value)}
                min={1}
                max={50}
                step={1}
                valueLabelDisplay='auto'
              />
            </Box>

            <Box
              sx={{
                opacity: `${tool === "pen" ? 0.5 : 1}`,
              }}
            >
              <Typography gutterBottom>Eraser size</Typography>
              <Slider
                value={eraserSize}
                onChange={(event, value) => setEraserSize(value)}
                min={1}
                max={50}
                step={1}
                valueLabelDisplay='auto'
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",

              opacity: `${tool === "eraser" ? 0.5 : 1}`,
              pointerEvents: `${tool === "eraser" ? "none" : "auto"}`,
            }}
          >
            <Box>
              <Typography gutterBottom>Color</Typography>
              {["#1976d2", "#d32f2f", "#388e3c", "#fbc02d", "#000000"].map(
                (color) => (
                  <IconButton
                    key={color}
                    onClick={() => {
                      setBrushColor(color);
                    }}
                    sx={{
                      ":hover": { backgroundColor: color, opacity: 0.5 },
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor:
                        brushColor === color ? "grey.400" : "transparent",
                      boxShadow: 1,
                      transform: brushColor === color ? "scale(1.1)" : "none",
                      outline:
                        brushColor === color
                          ? "2px solid rgba(25, 118, 210, 0.3)"
                          : "none",
                      outlineOffset: 2,
                      bgcolor: color,
                      p: 0,
                    }}
                  ></IconButton>
                )
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ width: 500, height: 400 }}>
          <canvas
            ref={canvasRef}
            style={{
              border: "2px solid #000",
              cursor: `${tool === "eraser" ? `grab` : `crosshair`}`,
              touchAction: "none",
              width: "100%",
              height: "100%",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant='outlined' onClick={clearCanvas}>
          Clear
        </Button>
        {handleSubmitDrawing && (
          <Button variant='contained' onClick={handleSubmit}>
            Submit Drawing
          </Button>
        )}
      </Box>
    </Box>
  );
}
