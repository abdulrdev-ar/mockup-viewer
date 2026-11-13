export type ExportOptions = { format: 'png' | 'jpeg'; size: number; transparent: boolean }

/** Diisi oleh Viewer saat terpasang, dipakai panel Unduh. */
export const viewerApi: {
  exportImage: ((o: ExportOptions) => Promise<Blob>) | null
  maxSize: number
} = { exportImage: null, maxSize: 2048 }
