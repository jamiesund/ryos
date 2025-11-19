import { Button } from "@/components/ui/button";
import { MenuBar } from "@/components/layout/MenuBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWinmxStore, WinmxTheme, VisualizationMode } from "@/stores/useWinmxStore";
import { useIpodStoreShallow } from "@/stores/helpers";
import { useThemeStore } from "@/stores/useThemeStore";
import { useShallow } from "zustand/react/shallow";

interface WinmxMenuBarProps {
  onShowHelp: () => void;
  onShowAbout: () => void;
  onAddTrack: () => void;
  onClearLibrary: () => void;
}

export function WinmxMenuBar({
  onShowHelp,
  onShowAbout,
  onAddTrack,
  onClearLibrary,
}: WinmxMenuBarProps) {
  const {
    theme,
    showEqualizer,
    showVisualization,
    visualizationMode,
    toggleEqualizer,
    toggleVisualization,
    setVisualizationMode,
    setTheme,
  } = useWinmxStore(
    useShallow((s) => ({
      theme: s.theme,
      showEqualizer: s.showEqualizer,
      showVisualization: s.showVisualization,
      visualizationMode: s.visualizationMode,
      toggleEqualizer: s.toggleEqualizer,
      toggleVisualization: s.toggleVisualization,
      setVisualizationMode: s.setVisualizationMode,
      setTheme: s.setTheme,
    }))
  );

  const {
    isShuffled,
    loopAll,
    loopCurrent,
    toggleShuffle,
    toggleLoopAll,
    toggleLoopCurrent,
  } = useIpodStoreShallow((s) => ({
    isShuffled: s.isShuffled,
    loopAll: s.loopAll,
    loopCurrent: s.loopCurrent,
    toggleShuffle: s.toggleShuffle,
    toggleLoopAll: s.toggleLoopAll,
    toggleLoopCurrent: s.toggleLoopCurrent,
  }));

  const currentTheme = useThemeStore((state) => state.current);
  const isXpTheme = currentTheme === "xp" || currentTheme === "win98";

  const visualizationModes: { label: string; value: VisualizationMode }[] = [
    { label: "Spectrum", value: "spectrum" },
    { label: "Oscilloscope", value: "oscilloscope" },
    { label: "Bars", value: "bars" },
    { label: "Off", value: "off" },
  ];

  const themes: { label: string; value: WinmxTheme }[] = [
    { label: "Classic WinMX", value: "classic" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

  return (
    <MenuBar>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-6 px-2 text-xs",
              isXpTheme && "font-['Pixelated_MS_Sans_Serif',Arial]"
            )}
            style={
              isXpTheme
                ? {
                    fontFamily: '"Pixelated MS Sans Serif", Arial',
                    fontSize: "11px",
                  }
                : undefined
            }
          >
            File
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onAddTrack}>Add Track...</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onClearLibrary}>Clear Library</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-6 px-2 text-xs",
              isXpTheme && "font-['Pixelated_MS_Sans_Serif',Arial]"
            )}
            style={
              isXpTheme
                ? {
                    fontFamily: '"Pixelated MS Sans Serif", Arial',
                    fontSize: "11px",
                  }
                : undefined
            }
          >
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={theme === t.value ? "bg-accent" : ""}
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleEqualizer}>
            {showEqualizer ? "Hide" : "Show"} Equalizer
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Visualization</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={toggleVisualization}>
                {showVisualization ? "Hide" : "Show"} Visualization
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {visualizationModes.map((mode) => (
                <DropdownMenuItem
                  key={mode.value}
                  onClick={() => {
                    setVisualizationMode(mode.value);
                    if (mode.value !== "off" && !showVisualization) {
                      toggleVisualization();
                    }
                  }}
                  className={visualizationMode === mode.value ? "bg-accent" : ""}
                >
                  {mode.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-6 px-2 text-xs",
              isXpTheme && "font-['Pixelated_MS_Sans_Serif',Arial]"
            )}
            style={
              isXpTheme
                ? {
                    fontFamily: '"Pixelated MS Sans Serif", Arial',
                    fontSize: "11px",
                  }
                : undefined
            }
          >
            Playback
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={toggleShuffle}>
            Shuffle {isShuffled ? "✓" : ""}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (loopCurrent) {
                toggleLoopCurrent();
              } else if (loopAll) {
                toggleLoopAll();
                toggleLoopCurrent();
              } else {
                toggleLoopAll();
              }
            }}
          >
            Repeat{" "}
            {loopCurrent ? "One ✓" : loopAll ? "All ✓" : "Off"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "h-6 px-2 text-xs",
              isXpTheme && "font-['Pixelated_MS_Sans_Serif',Arial]"
            )}
            style={
              isXpTheme
                ? {
                    fontFamily: '"Pixelated MS Sans Serif", Arial',
                    fontSize: "11px",
                  }
                : undefined
            }
          >
            Help
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onShowHelp}>Help...</DropdownMenuItem>
          <DropdownMenuItem onClick={onShowAbout}>About WinMX Player...</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </MenuBar>
  );
}

