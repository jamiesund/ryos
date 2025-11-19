import { BaseApp } from "../base/types";
import { WinmxAppComponent } from "./components/WinmxAppComponent";

export const helpItems = [
  {
    icon: "🎵",
    title: "Add Songs",
    description: "Paste YouTube URLs to add music to your WinMX player.",
  },
  {
    icon: "🎨",
    title: "Themes",
    description: "Switch between Classic WinMX, Light, and Dark themes.",
  },
  {
    icon: "🎛️",
    title: "Equalizer",
    description: "Adjust audio frequencies with presets or custom settings.",
  },
  {
    icon: "📊",
    title: "Visualization",
    description: "View spectrum analyzer, oscilloscope, or bar visualizations.",
  },
  {
    icon: "⏯️",
    title: "Playback Controls",
    description: "Play, pause, skip tracks, and control your music.",
  },
];

export const appMetadata = {
  name: "WinMX Player",
  version: "1.0",
  creator: {
    name: "Ryo Lu",
    url: "https://ryo.lu",
  },
  github: "https://github.com/ryokun6/ryos",
  icon: "/icons/default/music.png",
};

export const WinmxApp: BaseApp = {
  id: "winmx",
  name: "WinMX Player",
  icon: { type: "image", src: appMetadata.icon },
  description: "WinMX-style music player with themes, equalizer, and visualization",
  component: WinmxAppComponent,
  helpItems,
  metadata: appMetadata,
};

