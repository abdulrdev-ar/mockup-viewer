import type { Slice } from '../store.ts'

export type LightPreset = 'neutral' | 'warm' | 'contrast'
export type BackgroundType = 'color' | 'gradient' | 'image' | 'transparent'

export type Scene = {
  light: LightPreset
  /** 0.5 sampai 1.5 */
  lightIntensity: number
  background: { type: BackgroundType; color: string; color2: string; image: string | null }
}

export const DEFAULT_SCENE: Scene = {
  light: 'neutral',
  lightIntensity: 1,
  background: { type: 'color', color: '#E9E5E2', color2: '#D6E4FF', image: null },
}

export type SceneSlice = {
  scene: Scene
  setScene: (patch: Partial<Omit<Scene, 'background'>>) => void
  setBackground: (patch: Partial<Scene['background']>) => void
}

export const createSceneSlice: Slice<SceneSlice> = (set) => ({
  scene: DEFAULT_SCENE,
  setScene: (patch) => set((s) => ({ scene: { ...s.scene, ...patch } })),
  setBackground: (patch) =>
    set((s) => ({ scene: { ...s.scene, background: { ...s.scene.background, ...patch } } })),
})
