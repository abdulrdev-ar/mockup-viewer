import type { StateStorage } from 'zustand/middleware'

export type SaveStatus = 'saving' | 'saved' | 'error'

/** Status simpan untuk indikator di UI, dipisah dari store supaya tidak memicu riwayat. */
export const saveEvents = new EventTarget()
const emit = (status: SaveStatus) => saveEvents.dispatchEvent(new CustomEvent<SaveStatus>('status', { detail: status }))

let dbPromise: Promise<IDBDatabase> | null = null
const openDb = () =>
  (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open('mockup-viewer', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('kv')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }))

const run = <T>(mode: IDBTransactionMode, op: (s: IDBObjectStore) => IDBRequest<T>) =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = op(db.transaction('kv', mode).objectStore('kv'))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )

const available = () => typeof indexedDB !== 'undefined'
let timer: ReturnType<typeof setTimeout> | undefined

// ponytail: tulis ulang seluruh proyek tiap simpan (debounce 500 ms). Pecah per lapisan bila proyek jadi puluhan MB.
export const idbStorage: StateStorage = {
  getItem: (key) =>
    available()
      ? run<string | undefined>('readonly', (s) => s.get(key))
          .then((v) => v ?? null)
          .catch(() => (emit('error'), null))
      : null,
  setItem: (key, value) => {
    if (!available()) return
    emit('saving')
    clearTimeout(timer)
    timer = setTimeout(() => {
      run('readwrite', (s) => s.put(value, key))
        .then(() => emit('saved'))
        .catch(() => emit('error'))
    }, 500)
  },
  removeItem: (key) => {
    if (available()) void run('readwrite', (s) => s.delete(key))
  },
}
