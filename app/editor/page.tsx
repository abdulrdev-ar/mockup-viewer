import type { Metadata } from 'next'
import Editor from '@/components/editor/Editor'

export const metadata: Metadata = {
  title: 'Editor Kaos | Mockup Viewer',
  description: 'Atur warna, gambar, tulisan, bahan, kerah, lengan, dan potongan kaos dalam 3D, lalu unduh gambarnya.',
}

export default function EditorPage() {
  return <Editor />
}
