import { create, type StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'
import { BODY_H, MODELS, WRAP_W } from './garment.ts'
import { idbStorage } from './idb-storage.ts'
import { placeLayer } from './print.ts'
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
      version: 3,
      storage: idbStorage(),
      migrate: (persisted, version) => {
        const s = persisted as { layers?: (Layer & { zone: string })[] }
        if (!s.layers) return s as unknown as EditorState
        // Pusat zona lama (meter dari hem) dan jaraknya ke pusat kanvas bungkus (cm).
        const d = MODELS.short.dims
        const frontY = (d.H - d.dropFront - 0.05 + 0.06) / 2
        const backY = (d.H - d.dropBack - 0.08 + 0.06) / 2
        const toCanvas = (hemY: number) => (BODY_H / 2 - hemY) * 100
        // Versi 1 punya zona "Dada kiri", yang sekarang hanya posisi di depan.
        if (version < 2)
          s.layers = s.layers.map((l) =>
            l.zone === 'chestLeft' ? { ...l, zone: 'front', x: l.x + d.chest * 42, y: l.y + (frontY - (d.H - 0.17)) * 100 } : l,
          )
        // Versi 3 tidak punya zona: semua lapisan di satu kanvas yang melingkari kaos.
        if (version < 3)
          s.layers = s.layers.map(({ zone, ...l }) => {
            const shift: Record<string, [number, number]> = { back: [WRAP_W / 2, backY], sleeveL: [WRAP_W / 4, d.sleeve.y], sleeveR: [-WRAP_W / 4, d.sleeve.y] }
            const [dx, hemY] = shift[zone] ?? [0, frontY]
            return { ...l, ...placeLayer(l.x + dx, l.y + toCanvas(hemY)) } as Layer & { zone: string }
          })
        return s as unknown as EditorState
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
let holding = false

export function flushHistory() {
  clearTimeout(timer)
  if (pending) useEditorStore.getState().pushHistory(pending)
  pending = null
}

/** Selama seret di pratinjau 3D, seluruh gerakan jadi satu langkah undo walau pengguna berhenti sejenak. */
export function holdHistory(on: boolean) {
  flushHistory()
  holding = on
}

useEditorStore.subscribe((s, prev) => {
  if (!prev.hydrated) return
  if (s.past !== prev.past || s.future !== prev.future) return
  if (s.garment === prev.garment && s.layers === prev.layers && s.scene === prev.scene) return
  pending ??= snapshot(prev)
  clearTimeout(timer)
  if (!holding) timer = setTimeout(flushHistory, 400)
})

export const undo = () => (flushHistory(), useEditorStore.getState().undo())
export const redo = () => (flushHistory(), useEditorStore.getState().redo())
