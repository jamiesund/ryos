import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { WinmxTheme, useWinmxStore, EQUALIZER_PRESETS } from "@/stores/useWinmxStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WinmxEqualizerProps {
  theme: WinmxTheme;
}

const BAND_LABELS = ["31", "62", "125", "250", "500", "1K", "2K", "4K", "8K", "16K"];

export function WinmxEqualizer({ theme }: WinmxEqualizerProps) {
  const equalizerBands = useWinmxStore((s) => s.equalizerBands);
  const currentPreset = useWinmxStore((s) => s.currentPreset);
  const setEqualizerBand = useWinmxStore((s) => s.setEqualizerBand);
  const setEqualizerPreset = useWinmxStore((s) => s.setEqualizerPreset);
  const resetEqualizer = useWinmxStore((s) => s.resetEqualizer);
  
  // Memoize band values to prevent infinite loops
  const bandValues = useMemo(() => {
    return BAND_LABELS.map((_, index) => equalizerBands[index] || 0);
  }, [equalizerBands]);

  const handleBandChange = useCallback(
    (index: number, value: number[]) => {
      setEqualizerBand(index, value[0]);
    },
    [setEqualizerBand]
  );

  const handlePresetChange = useCallback(
    (presetName: string) => {
      setEqualizerPreset(presetName);
    },
    [setEqualizerPreset]
  );

  const themeClasses = {
    classic: {
      bg: "bg-[#0f1620]",
      text: "text-[#4a9eff]",
      border: "border-[#4a9eff]/20",
      button: "bg-[#2a3a52] hover:bg-[#3a4a62] text-[#4a9eff] border border-[#4a9eff]/50",
      select: "bg-[#1a2332] border-[#4a9eff]/30 text-[#4a9eff]",
    },
    light: {
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-300",
      button: "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300",
      select: "bg-gray-50 border-gray-300 text-gray-800",
    },
    dark: {
      bg: "bg-[#0a0a0a]",
      text: "text-gray-200",
      border: "border-gray-800",
      button: "bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-200 border border-gray-700",
      select: "bg-[#111111] border-gray-800 text-gray-200",
    },
  };

  const t = themeClasses[theme];

  return (
    <div className={cn("p-3", t.bg, t.text)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold">Equalizer</div>
        <div className="flex items-center gap-2">
          <Select value={currentPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className={cn("h-7 w-32 text-xs", t.select)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUALIZER_PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEqualizer}
            className={cn("h-7 text-xs", t.button)}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {BAND_LABELS.map((label, index) => {
          const bandValue = bandValues[index];
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div className={cn("text-[10px] font-mono", t.text, "opacity-75")}>
                {label}
              </div>
              <div className="flex flex-col items-center gap-1 w-full">
                <Slider
                  value={[bandValue]}
                  onValueChange={(value) => handleBandChange(index, value)}
                  min={-12}
                  max={12}
                  step={1}
                  orientation="vertical"
                  className="h-24"
                />
                <div className={cn("text-[10px] font-mono", t.text, "opacity-75")}>
                  {bandValue > 0 ? "+" : ""}
                  {bandValue}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

