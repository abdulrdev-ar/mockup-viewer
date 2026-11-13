import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from './idb-storage.ts'
import { createDesignSlice, type DesignSlice } from './slices/design.ts'
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
      version: 1,
      storage: createJSONStorage(() => idbStorage),
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
