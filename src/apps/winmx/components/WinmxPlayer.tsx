import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Track } from "@/stores/useIpodStore";
import { WinmxTheme } from "@/stores/useWinmxStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useWinmxStore } from "@/stores/useWinmxStore";

interface WinmxPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  elapsedTime: number;
  totalTime: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  theme: WinmxTheme;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function WinmxPlayer({
  currentTrack,
  isPlaying,
  elapsedTime,
  totalTime,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  theme,
}: WinmxPlayerProps) {
  const volume = useWinmxStore((s) => s.volume);
  const setVolume = useWinmxStore((s) => s.setVolume);

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0]);
    },
    [setVolume]
  );

  const themeClasses = {
    classic: {
      bg: "bg-[#1a2332]",
      text: "text-[#4a9eff]",
      border: "border-[#4a9eff]/30",
      button: "bg-[#2a3a52] hover:bg-[#3a4a62] text-[#4a9eff] border border-[#4a9eff]/50 active:bg-[#1a2a42]",
      buttonActive: "bg-[#4a9eff] text-[#1a2332]",
      progressBg: "bg-[#0f1620]",
      progressFill: "bg-[#4a9eff]",
    },
    light: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      button: "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 active:bg-gray-100",
      buttonActive: "bg-gray-800 text-white",
      progressBg: "bg-gray-200",
      progressFill: "bg-gray-600",
    },
    dark: {
      bg: "bg-[#111111]",
      text: "text-gray-200",
      border: "border-gray-700",
      button: "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-200 border border-gray-700 active:bg-[#0a0a0a]",
      buttonActive: "bg-gray-200 text-[#111111]",
      progressBg: "bg-[#000000]",
      progressFill: "bg-gray-400",
    },
  };

  const t = themeClasses[theme];
  const progress = totalTime > 0 ? (elapsedTime / totalTime) * 100 : 0;

  const bgColor = theme === "classic" ? "#1a2332" : theme === "light" ? "#f3f4f6" : "#111111";
  const textColor = theme === "classic" ? "#4a9eff" : theme === "light" ? "#1f2937" : "#e5e7eb";

  return (
    <div className={cn("p-4 border-b flex-shrink-0", t.border, t.bg)} style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Track Info */}
      <div className={cn("mb-3 text-center", t.text)} style={{ color: textColor }}>
        <div className="font-bold text-sm truncate">
          {currentTrack?.title || "No track selected"}
        </div>
        {currentTrack?.artist && (
          <div className="text-xs opacity-75 truncate">{currentTrack.artist}</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div
          className={cn("h-1 rounded-full overflow-hidden cursor-pointer", t.progressBg)}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const seekTime = percentage * totalTime;
            onSeek(seekTime);
          }}
        >
          <div
            className={cn("h-full transition-all duration-100", t.progressFill)}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: textColor }}>
          <span className="opacity-75">{formatTime(elapsedTime)}</span>
          <span className="opacity-75">{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          className={cn("h-8 w-8 p-0", t.button)}
        >
          ⏮
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className={cn("h-10 w-10 p-0", isPlaying ? t.buttonActive : t.button)}
        >
          {isPlaying ? "⏸" : "▶"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          className={cn("h-8 w-8 p-0", t.button)}
        >
          ⏭
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2" style={{ color: textColor }}>
        <span className="text-xs w-12">Volume</span>
        <Slider
          value={useMemo(() => [volume], [volume])}
          onValueChange={handleVolumeChange}
          min={0}
          max={1}
          step={0.01}
          className="flex-1"
        />
        <span className="text-xs w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}

