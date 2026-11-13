import type { Slice } from '../store.ts'
import type { Zone } from './design.ts'

export type PanelId = 'upload' | 'text' | 'layers' | 'color' | 'material' | 'shape' | 'scene' | 'export'
export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'threeQuarter' | 'collar' | 'sleeve'
export type Quality = 'low' | 'medium' | 'high'

export type UiSlice = {
  panel: PanelId
  /** sisi kaos yang sedang diedit di kanvas desain */
  surface: Zone
  hydrated: boolean
  recentColors: string[]
  /** kualitas render, tidak masuk riwayat undo */
  quality: Quality
  showGuides: boolean
  webglError: boolean
  /** nonce berubah tiap permintaan supaya preset yang sama bisa dipilih ulang */
  cameraRequest: { preset: CameraPreset | 'reset'; nonce: number } | null
  toast: { text: string; tone: 'info' | 'error'; nonce: number } | null
  setPanel: (panel: PanelId) => void
  setSurface: (surface: Zone) => void
  setQuality: (quality: Quality) => void
  setShowGuides: (show: boolean) => void
  requestCamera: (preset: CameraPreset | 'reset') => void
  showToast: (text: string, tone?: 'info' | 'error') => void
}

export const createUiSlice: Slice<UiSlice> = (set) => ({
  panel: 'upload',
  surface: 'front',
  hydrated: false,
  recentColors: [],
  quality: 'high',
  showGuides: true,
  webglError: false,
  cameraRequest: null,
  toast: null,
  setPanel: (panel) => set({ panel }),
  setSurface: (surface) => set({ surface }),
  setQuality: (quality) => set({ quality }),
  setShowGuides: (showGuides) => set({ showGuides }),
  requestCamera: (preset) => set({ cameraRequest: { preset, nonce: Date.now() } }),
  showToast: (text, tone = 'info') => set({ toast: { text, tone, nonce: Date.now() } }),
})
