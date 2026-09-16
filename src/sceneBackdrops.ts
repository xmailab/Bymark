import type { SceneBackdropPreset } from "./default-settings";

export interface SceneBackdropOption {
  id: SceneBackdropPreset;
  label: string;
  gradient: string;
}

export const DEFAULT_SCENE_BACKDROP: SceneBackdropPreset = "lagoon";

export const SCENE_BACKDROPS: readonly SceneBackdropOption[] = [
  { id: "lagoon", label: "雨林深海", gradient: "linear-gradient(135deg, #D3D3D3 0%, #A9A9A9 50%, #696969 100%)" },
  { id: "sky", label: "晴空蓝", gradient: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)" },
  { id: "graphite", label: "石墨蓝灰", gradient: "linear-gradient(135deg, #2C3539 0%, #4F4F4F 100%)" },
] as const;

export function normalizeSceneBackdrop(value: unknown): SceneBackdropPreset {
  return SCENE_BACKDROPS.some((backdrop) => backdrop.id === value)
    ? value as SceneBackdropPreset
    : DEFAULT_SCENE_BACKDROP;
}

export function sceneBackdropFor(value: unknown): SceneBackdropOption {
  const id = normalizeSceneBackdrop(value);
  return SCENE_BACKDROPS.find((backdrop) => backdrop.id === id) ?? SCENE_BACKDROPS[0];
}
