export type ExportOptions = { format: 'png' | 'jpeg'; size: number; transparent: boolean }

/** Diisi oleh Viewer saat terpasang. */
export const viewerApi: {
  exportImage: ((o: ExportOptions) => Promise<Blob>) | null
  maxSize: number
  /** Titik kaos (cm kanvas cetak) di bawah koordinat layar, atau di tengah pratinjau bila tanpa koordinat. */
  aim: ((clientX?: number, clientY?: number) => { x: number; y: number } | null) | null
} = { exportImage: null, maxSize: 2048, aim: null }
