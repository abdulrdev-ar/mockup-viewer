import type { EditorState, Slice } from '../store.ts'

export type Snapshot = Pick<EditorState, 'garment' | 'layers' | 'scene'>

export const HISTORY_LIMIT = 100

export type HistorySlice = {
  past: Snapshot[]
  future: Snapshot[]
  /** dipanggil oleh pencatat riwayat di store.ts */
  pushHistory: (snap: Snapshot) => void
  undo: () => void
  redo: () => void
}

export const snapshot = (s: Snapshot): Snapshot => ({ garment: s.garment, layers: s.layers, scene: s.scene })

export const createHistorySlice: Slice<HistorySlice> = (set, get) => ({
  past: [],
  future: [],
  pushHistory: (snap) => set((s) => ({ past: [...s.past, snap].slice(-HISTORY_LIMIT), future: [] })),
  undo: () => {
    const { past, future } = get()
    const prev = past.at(-1)
    if (!prev) return
    set({ ...prev, past: past.slice(0, -1), future: [snapshot(get()), ...future], selectedId: null })
  },
  redo: () => {
    const { past, future } = get()
    const next = future[0]
    if (!next) return
    set({ ...next, past: [...past, snapshot(get())], future: future.slice(1), selectedId: null })
  },
})
