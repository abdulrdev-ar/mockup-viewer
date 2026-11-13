import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MODELS } from './garment.ts'
import { idbStorage } from './idb-storage.ts'
import { zoneCenterY } from './print.ts'
import { createDesignSlice, type DesignSlice, type Layer } from './slices/design.ts'
import { createGarmentSlice, type GarmentSlice } from './slices/garment.ts'
import { createHistorySlice, snapshot, type HistorySlice, type Snapshot } from './slices/history.ts'
import { createSceneSlice, type SceneSlice } from './slices/scene.ts'
import { createUiSlice, type UiSlice } from './slices/ui.ts'

export type EditorState = GarmentSlice & DesignSlice & SceneSlice & HistorySlice & UiSlice
export type Slice<T> = StateCreator<EditorState, [['zustand/persist', unknown]], [], T>

export const useEditorStore = create<EditorState>()(
  persist(
    (...a) => ({
      ...createGarmentSlice(...a),
      ...createDesignSlice(...a),
      ...createSceneSlice(...a),
      ...createHistorySlice(...a),
      ...createUiSlice(...a),
    }),
    {
      name: 'mockup-viewer:project',
      version: 2,
      storage: createJSONStorage(() => idbStorage),
      // Versi 1 punya zona "Dada kiri". Sekarang dada kiri hanya posisi di sisi Depan.
      migrate: (persisted, version) => {
        const s = persisted as { layers?: (Omit<Layer, 'zone'> & { zone: string })[] }
        if (version < 2 && s.layers) {
          const d = MODELS.short.dims
          s.layers = s.layers.map((l) =>
            l.zone === 'chestLeft' ? { ...l, zone: 'front', x: l.x + d.chest * 42, y: l.y + (zoneCenterY(d, 'front') - (d.H - 0.17)) * 100 } : l,
          )
        }
        return s as EditorState
      },
      partialize: (s) => ({
        garment: s.garment,
        layers: s.layers,
        scene: s.scene,
        recentColors: s.recentColors,
        quality: s.quality,
      }),
      // Hidrasi dipanggil Editor di klien, supaya render server memakai keadaan awal.
      skipHydration: true,
      onRehydrateStorage: () => () => useEditorStore.setState({ hydrated: true }),
    },
  ),
)

// Pencatat riwayat: satu rentetan perubahan (misalnya menggeser slider) jadi satu langkah undo.
let pending: Snapshot | null = null
let timer: ReturnType<typeof setTimeout> | undefined

export function flushHistory() {
  clearTimeout(timer)
  if (pending) useEditorStore.getState().pushHistory(pending)
  pending = null
}

useEditorStore.subscribe((s, prev) => {
  if (!prev.hydrated) return
  if (s.past !== prev.past || s.future !== prev.future) return
  if (s.garment === prev.garment && s.layers === prev.layers && s.scene === prev.scene) return
  pending ??= snapshot(prev)
  clearTimeout(timer)
  timer = setTimeout(flushHistory, 400)
})

export const undo = () => (flushHistory(), useEditorStore.getState().undo())
export const redo = () => (flushHistory(), useEditorStore.getState().redo())
