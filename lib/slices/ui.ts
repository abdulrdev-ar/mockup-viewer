import type { Slice } from '../store.ts'

export type PanelId = 'upload' | 'text' | 'color' | 'material' | 'shape' | 'scene' | 'export'
export type CameraPreset = 'front' | 'back' | 'left' | 'right' | 'threeQuarter' | 'collar' | 'sleeve'
export type Quality = 'low' | 'medium' | 'high'

export type UiSlice = {
  panel: PanelId
  hydrated: boolean
  recentColors: string[]
  /** kualitas render, tidak masuk riwayat undo */
  quality: Quality
  webglError: boolean
  /** nonce berubah tiap permintaan supaya preset yang sama bisa dipilih ulang */
  cameraRequest: { preset: CameraPreset | 'reset'; nonce: number } | null
  toast: { text: string; tone: 'info' | 'error'; nonce: number } | null
  setPanel: (panel: PanelId) => void
  setQuality: (quality: Quality) => void
  requestCamera: (preset: CameraPreset | 'reset') => void
  showToast: (text: string, tone?: 'info' | 'error') => void
}

// Tablet dan ponsel (pointer kasar) mulai di kualitas sedang. Pilihan pengguna yang tersimpan tetap menang.
const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export const createUiSlice: Slice<UiSlice> = (set) => ({
  panel: 'upload',
  hydrated: false,
  recentColors: [],
  quality: touch ? 'medium' : 'high',
  webglError: false,
  cameraRequest: null,
  toast: null,
  setPanel: (panel) => set({ panel }),
  setQuality: (quality) => set({ quality }),
  requestCamera: (preset) => set({ cameraRequest: { preset, nonce: Date.now() } }),
  showToast: (text, tone = 'info') => set({ toast: { text, tone, nonce: Date.now() } }),
})
