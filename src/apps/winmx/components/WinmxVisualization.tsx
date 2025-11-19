import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { WinmxTheme, useWinmxStore } from "@/stores/useWinmxStore";

interface WinmxVisualizationProps {
  analyzer: AnalyserNode | null;
  theme: WinmxTheme;
}

export function WinmxVisualization({ analyzer, theme }: WinmxVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const { visualizationMode } = useWinmxStore((s) => ({
    visualizationMode: s.visualizationMode,
  }));

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!analyzer || !canvasRef.current || visualizationMode === "off") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyzer.getByteFrequencyData(dataArray);

      ctx.fillStyle = theme === "classic" ? "#0f1620" : theme === "light" ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, width, height);

      if (visualizationMode === "spectrum") {
        drawSpectrum(ctx, dataArray, bufferLength, width, height);
      } else if (visualizationMode === "oscilloscope") {
        analyzer.getByteTimeDomainData(dataArray);
        drawOscilloscope(ctx, dataArray, bufferLength, width, height);
      } else if (visualizationMode === "bars") {
        drawBars(ctx, dataArray, bufferLength, width, height);
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyzer, visualizationMode, theme]);

  const themeColors = {
    classic: {
      primary: "#4a9eff",
      secondary: "#2a5a8f",
      bg: "#0f1620",
    },
    light: {
      primary: "#4a5568",
      secondary: "#718096",
      bg: "#ffffff",
    },
    dark: {
      primary: "#e2e8f0",
      secondary: "#cbd5e0",
      bg: "#000000",
    },
  };

  const colors = themeColors[theme];

  const drawSpectrum = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    const barWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(1, colors.secondary);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth;
    }
  };

  const drawOscilloscope = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.primary;
    ctx.beginPath();

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };

  const drawBars = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array,
    bufferLength: number,
    width: number,
    height: number
  ) => {
    const barCount = 32;
    const barWidth = width / barCount;
    const dataStep = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep;
      const barHeight = (dataArray[dataIndex] / 255) * height;

      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(1, colors.secondary);

      ctx.fillStyle = gradient;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }
  };

  if (visualizationMode === "off") {
    const colors = themeColors[theme];
    return (
      <div className={cn("h-full flex items-center justify-center")} style={{ backgroundColor: colors.bg }}>
        <span className="text-sm opacity-50" style={{ color: colors.primary }}>
          Visualization Off
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

