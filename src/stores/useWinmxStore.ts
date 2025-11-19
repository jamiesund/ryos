import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WinmxTheme = "classic" | "light" | "dark";
export type VisualizationMode = "spectrum" | "oscilloscope" | "bars" | "off";

export interface EqualizerPreset {
  name: string;
  bands: number[];
}

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: "Normal", bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Rock", bands: [6, 4, -3, -4, -2, 2, 5, 7, 7, 6] },
  { name: "Pop", bands: [-1, 4, 7, 8, 5, 0, -2, -2, -1, -1] },
  { name: "Jazz", bands: [5, 3, 2, 1, 0, 0, 1, 2, 3, 4] },
  { name: "Classical", bands: [5, 4, 3, 0, 0, 0, 0, 3, 4, 5] },
  { name: "Bass Boost", bands: [8, 7, 5, 3, 1, 0, 0, 0, 0, 0] },
  { name: "Treble Boost", bands: [0, 0, 0, 0, 0, 1, 3, 5, 7, 8] },
];

interface WinmxData {
  theme: WinmxTheme;
  showEqualizer: boolean;
  showVisualization: boolean;
  visualizationMode: VisualizationMode;
  equalizerBands: number[]; // 10-band equalizer: -12 to +12 dB
  currentPreset: string;
  volume: number; // 0-1
}

const initialWinmxData: WinmxData = {
  theme: "classic",
  showEqualizer: false,
  showVisualization: false,
  visualizationMode: "spectrum",
  equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  currentPreset: "Normal",
  volume: 0.8,
};

export interface WinmxState extends WinmxData {
  setTheme: (theme: WinmxTheme) => void;
  toggleEqualizer: () => void;
  toggleVisualization: () => void;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setEqualizerBand: (index: number, value: number) => void;
  setEqualizerPreset: (presetName: string) => void;
  setVolume: (volume: number) => void;
  resetEqualizer: () => void;
}

export const useWinmxStore = create<WinmxState>()(
  persist(
    (set, get) => ({
      ...initialWinmxData,
      setTheme: (theme) => set({ theme }),
      toggleEqualizer: () => set((state) => ({ showEqualizer: !state.showEqualizer })),
      toggleVisualization: () => set((state) => ({ showVisualization: !state.showVisualization })),
      setVisualizationMode: (mode) => set({ visualizationMode: mode }),
      setEqualizerBand: (index, value) =>
        set((state) => {
          const newBands = [...state.equalizerBands];
          newBands[index] = Math.max(-12, Math.min(12, value));
          return { equalizerBands: newBands };
        }),
      setEqualizerPreset: (presetName) => {
        const preset = EQUALIZER_PRESETS.find((p) => p.name === presetName);
        if (preset) {
          set({ equalizerBands: [...preset.bands], currentPreset: presetName });
        }
      },
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      resetEqualizer: () =>
        set({
          equalizerBands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          currentPreset: "Normal",
        }),
    }),
    {
      name: "ryos:winmx",
      partialize: (state) => ({
        theme: state.theme,
        showEqualizer: state.showEqualizer,
        showVisualization: state.showVisualization,
        visualizationMode: state.visualizationMode,
        equalizerBands: state.equalizerBands,
        currentPreset: state.currentPreset,
        volume: state.volume,
      }),
    }
  )
);

