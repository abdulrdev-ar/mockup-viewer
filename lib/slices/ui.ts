import type { Slice } from '../store.ts'

export type PanelId = 'color' | 'design' | 'material' | 'shape' | 'scene' | 'export'
export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'threeQuarter' | 'collar' | 'sleeve'
export type Quality = 'low' | 'medium' | 'high'

export type UiSlice = {
  panel: PanelId
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
  setQuality: (quality: Quality) => void
  setShowGuides: (show: boolean) => void
  requestCamera: (preset: CameraPreset | 'reset') => void
  showToast: (text: string, tone?: 'info' | 'error') => void
}

export const createUiSlice: Slice<UiSlice> = (set) => ({
  panel: 'color',
  hydrated: false,
  recentColors: [],
  quality: 'high',
  showGuides: true,
  webglError: false,
  cameraRequest: null,
  toast: null,
  setPanel: (panel) => set({ panel }),
  setQuality: (quality) => set({ quality }),
  setShowGuides: (showGuides) => set({ showGuides }),
  requestCamera: (preset) => set({ cameraRequest: { preset, nonce: Date.now() } }),
  showToast: (text, tone = 'info') => set({ toast: { text, tone, nonce: Date.now() } }),
})
