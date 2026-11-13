'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FABRIC, THICKNESS_NORMAL, fabricNormalTexture } from '@/lib/fabric'
import { PRINT_FONT_FAMILIES } from '@/lib/fonts'
import { MODELS, modelOf, printAttributes, type Dims, type ModelId, type ModelPart } from '@/lib/garment'
import { paintCanvas, zoneFrames, type CanvasId } from '@/lib/print'
import type { Garment } from '@/lib/slices/garment'
import type { Scene } from '@/lib/slices/scene'
import type { CameraPreset, Quality } from '@/lib/slices/ui'
import { useEditorStore, type EditorState } from '@/lib/store'
import { viewerApi } from '@/lib/viewer-api'
import styles from './editor.module.css'

const PARTS: ModelPart[] = ['body', 'sleeveL', 'sleeveR', 'collar']

const LIGHTS = {
  neutral: { env: 0.7, key: 1.4, color: 0xffffff, rim: 0, pos: [-0.9, 3, 1.6] },
  warm: { env: 0.6, key: 1.6, color: 0xffe0bd, rim: 0.3, pos: [-0.9, 3, 1.6] },
  contrast: { env: 0.25, key: 2.8, color: 0xffffff, rim: 1.2, pos: [-2.2, 1.6, 1.2] },
} as const

const QUALITY: Record<Quality, { ratio: number; body: number; sleeve: number; shadows: boolean }> = {
  high: { ratio: 2, body: 4096, sleeve: 1024, shadows: true },
  medium: { ratio: 1.25, body: 2048, sleeve: 512, shadows: true },
  low: { ratio: 1, body: 2048, sleeve: 512, shadows: false },
}
const QUALITY_DOWN: Record<Quality, Quality> = { high: 'medium', medium: 'low', low: 'low' }

const WHITE = new THREE.Color(0xffffff)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export default function Viewer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const retryRef = useRef<() => void>(() => {})

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const store = useEditorStore

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      store.setState({ webglError: true })
      return
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    const canvas = renderer.domElement
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', 'Pratinjau 3D kaos. Seret untuk memutar, gulir atau cubit untuk memperbesar.')
    canvas.setAttribute('aria-describedby', 'garment-description')
    canvas.className = styles.canvas
    host.appendChild(canvas)

    const gl = renderer.getContext()
    viewerApi.maxSize = Math.min(4096, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE), gl.getParameter(gl.MAX_TEXTURE_SIZE))
    const aniso = renderer.capabilities.getMaxAnisotropy()

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    scene.environment = pmrem.fromScene(room, 0.04).texture
    room.dispose()

    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 0.4
    controls.maxDistance = 5
    controls.screenSpacePanning = true

    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.radius = 6
    key.shadow.bias = -0.0005
    Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.5, far: 8 })
    const rim = new THREE.DirectionalLight(0xffffff, 0)
    rim.position.set(1.5, 1.5, -2)
    scene.add(key, rim)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: 0.09 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Kanvas cetak: warna kain + gambar + teks, dipakai sebagai tekstur.
    const canvases: Record<CanvasId, HTMLCanvasElement> = {
      body: document.createElement('canvas'),
      sleeveL: document.createElement('canvas'),
      sleeveR: document.createElement('canvas'),
    }
    const textures = {} as Record<CanvasId, THREE.CanvasTexture>
    const makeTexture = (id: CanvasId) => {
      textures[id]?.dispose()
      const t = new THREE.CanvasTexture(canvases[id])
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = aniso
      textures[id] = t
      return t
    }

    // Model hanya berisi permukaan luar kain. Sisi belakangnya adalah bagian dalam kaos (terlihat dari leher
    // dan ujung lengan): digelapkan dan tanpa cetakan. Peta cetak juga hanya tampil di titik bermasker 1
    // (printAttributes); di luar itu dipakai warna kain dari pojok kanvas, yang selalu polos (paintCanvas).
    const INSIDE = 'diffuseColor.rgb *= gl_FrontFacing ? 1.0 : 0.62;'
    const material = (print: boolean) => {
      const m = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide })
      // Dua varian shader dari fungsi yang sama: kunci cache harus berbeda supaya program tidak tertukar.
      m.customProgramCacheKey = () => (print ? 'kain-cetak' : 'kain')
      m.onBeforeCompile = (s) => {
        if (!print) {
          s.fragmentShader = s.fragmentShader.replace('#include <map_fragment>', INSIDE)
          return
        }
        s.vertexShader = s.vertexShader
          .replace('#include <common>', '#include <common>\nattribute float printMask;\nvarying float vPrintMask;')
          .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPrintMask = printMask;')
        s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vPrintMask;').replace(
          '#include <map_fragment>',
          `diffuseColor *= mix(texture2D(map, vec2(0.001)), texture2D(map, vMapUv), gl_FrontFacing ? vPrintMask : 0.0);\n${INSIDE}`,
        )
      }
      return m
    }
    const outer: Record<ModelPart, THREE.MeshPhysicalMaterial> = {
      body: material(true),
      sleeveL: material(true),
      sleeveR: material(true),
      collar: material(false),
    }
    const group = new THREE.Group()
    const mesh = (p: ModelPart) => {
      const m = new THREE.Mesh(new THREE.BufferGeometry(), outer[p])
      m.castShadow = true
      return m
    }
    const meshes = { body: mesh('body'), sleeveL: mesh('sleeveL'), sleeveR: mesh('sleeveR'), collar: mesh('collar') }
    group.add(...Object.values(meshes))
    scene.add(group)

    let model: ModelId = modelOf(store.getState().garment)
    let dims: Dims = MODELS[model].dims
    let dirty = true
    let hideGuides = false
    let disposed = false
    const images = new Map<string, HTMLImageElement>()
    const fontState = new Map<string, 'loading' | 'ready'>()

    // --- model kaos ---
    const loader = new GLTFLoader()
    const geometries = new Map<ModelId, Record<ModelPart, THREE.BufferGeometry>>()
    async function loadModel(id: ModelId) {
      setStatus('loading')
      try {
        let geos = geometries.get(id)
        if (!geos) {
          const gltf = await loader.loadAsync(MODELS[id].url)
          const found = {} as Record<ModelPart, THREE.BufferGeometry>
          gltf.scene.traverse((o) => {
            if (o instanceof THREE.Mesh && PARTS.includes(o.name as ModelPart)) found[o.name as ModelPart] = o.geometry
          })
          for (const part of PARTS) {
            const geo = found[part]
            if (!geo) throw new Error(`bagian ${part} tidak ada`)
            // Atribut GLB bisa berselang (interleaved), jadi .array tidak bisa dibaca langsung.
            const attr = (name: string) => {
              const a = geo.getAttribute(name)
              return Float32Array.from({ length: a.count * a.itemSize }, (_, k) => a.getComponent(Math.floor(k / a.itemSize), k % a.itemSize))
            }
            const a = printAttributes(attr('position'), attr('normal'), part, MODELS[id].dims)
            // UV asli dipakai tekstur serat (channel 1), UV cetak dipakai kanvas (channel 0).
            geo.setAttribute('uv1', geo.getAttribute('uv'))
            geo.setAttribute('uv', new THREE.BufferAttribute(a.uv, 2))
            geo.setAttribute('printMask', new THREE.BufferAttribute(a.mask, 1))
          }
          geos = found
          geometries.set(id, geos)
        }
        // Pengguna bisa sudah memilih lengan lain saat model ini dimuat.
        if (disposed || id !== modelOf(store.getState().garment)) return
        model = id
        dims = MODELS[id].dims
        for (const part of PARTS) meshes[part].geometry = geos[part]
        group.position.y = -dims.H * 0.55
        // Ujung lengan panjang turun sekitar 7 cm di bawah hem.
        ground.position.y = group.position.y - 0.08
        applyFabric(store.getState().garment)
        dirty = true
        setStatus('ready')
      } catch {
        if (!disposed) setStatus('error')
      }
    }
    retryRef.current = () => void loadModel(modelOf(store.getState().garment))

    // --- bahan ---
    const normalClones: THREE.Texture[] = []
    function applyFabric(g: Garment) {
      const f = FABRIC[g.material]
      const base = fabricNormalTexture(g.material)
      normalClones.splice(0).forEach((t) => t.dispose())
      for (const part of PARTS) {
        const m = outer[part]
        const n = base.clone()
        n.channel = 1
        n.repeat.setScalar(dims.uvMeters / f.tile)
        n.anisotropy = aniso
        normalClones.push(n)
        m.normalMap = n
        m.normalScale.setScalar(f.normal * THICKNESS_NORMAL[g.thickness])
        m.roughness = f.roughness
        m.sheen = f.sheen
        m.sheenRoughness = f.sheenRoughness
        m.needsUpdate = true
      }
    }

    // --- warna dan cetakan ---
    function applyColors(g: Garment) {
      outer.collar.color.set(g.colors.collar)
      // Kilap serat mengikuti warna kain supaya warna gelap tidak tampak berdebu.
      for (const part of PARTS) outer[part].sheenColor.set(g.colors[part]).lerp(WHITE, 0.5)
      dirty = true
    }

    function ensureAssets(s: EditorState) {
      for (const l of s.layers) {
        if (l.kind === 'image' && !images.has(l.src)) {
          const img = new Image()
          img.onload = () => (dirty = true)
          img.onerror = () => store.getState().showToast('Gambar tidak bisa dibuka. Coba simpan ulang lalu unggah lagi.', 'error')
          img.src = l.src
          images.set(l.src, img)
        }
        if (l.kind === 'text') {
          const family = PRINT_FONT_FAMILIES[l.font]
          if (!fontState.has(family)) {
            fontState.set(family, 'loading')
            document.fonts.load(`48px ${family}`).finally(() => {
              fontState.set(family, 'ready')
              dirty = true
            })
          }
        }
      }
    }

    function repaint() {
      const s = store.getState()
      ensureAssets(s)
      const frames = zoneFrames(dims, canvases.body.width, canvases.sleeveL.width)
      const selected = s.layers.find((l) => l.id === s.selectedId)
      const loaded = new Map<string, CanvasImageSource>()
      images.forEach((img, src) => img.complete && img.naturalWidth > 0 && loaded.set(src, img))
      const input = {
        garment: s.garment,
        layers: s.layers,
        frames,
        fonts: PRINT_FONT_FAMILIES,
        images: loaded,
        guide: !hideGuides && s.showGuides && selected ? selected.zone : null,
      }
      for (const id of Object.keys(canvases) as CanvasId[]) {
        const ctx = canvases[id].getContext('2d')
        if (!ctx) continue
        paintCanvas(id, ctx, input)
        textures[id].needsUpdate = true
      }
    }

    // --- kualitas ---
    function applyQuality(q: Quality) {
      const c = QUALITY[q]
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, c.ratio))
      renderer.shadowMap.enabled = c.shadows
      key.castShadow = c.shadows
      canvases.body.width = c.body
      canvases.body.height = c.body / 2
      for (const id of ['sleeveL', 'sleeveR'] as const) canvases[id].width = canvases[id].height = c.sleeve
      for (const id of Object.keys(canvases) as CanvasId[]) {
        const part = id as keyof typeof outer
        outer[part].map = makeTexture(id)
        outer[part].needsUpdate = true
      }
      outer.body.color.set(0xffffff)
      outer.sleeveL.color.set(0xffffff)
      outer.sleeveR.color.set(0xffffff)
      resize()
      dirty = true
    }

    // --- latar dan cahaya ---
    let bgTexture: THREE.Texture | null = null
    let bgToken = 0
    function coverBackground(aspect: number) {
      const t = bgTexture
      if (!t || !(t.image instanceof HTMLImageElement)) return
      const ia = t.image.naturalWidth / t.image.naturalHeight
      t.repeat.set(ia > aspect ? aspect / ia : 1, ia > aspect ? 1 : ia / aspect)
      t.offset.set((1 - t.repeat.x) / 2, (1 - t.repeat.y) / 2)
    }
    function applyScene(sc: Scene, prev?: Scene) {
      const l = LIGHTS[sc.light]
      scene.environmentIntensity = l.env * sc.lightIntensity
      key.intensity = l.key * sc.lightIntensity
      key.color.set(l.color)
      key.position.set(l.pos[0], l.pos[1], l.pos[2])
      rim.intensity = l.rim * sc.lightIntensity
      if (prev && prev.background === sc.background) return
      const bg = sc.background
      const token = ++bgToken
      bgTexture?.dispose()
      bgTexture = null
      renderer.setClearColor(0x000000, 0)
      if (bg.type === 'color') scene.background = new THREE.Color(bg.color)
      else if (bg.type === 'gradient') {
        const c = document.createElement('canvas')
        c.width = 4
        c.height = 512
        const ctx = c.getContext('2d')
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, 512)
          grad.addColorStop(0, bg.color)
          grad.addColorStop(1, bg.color2)
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, 4, 512)
        }
        bgTexture = new THREE.CanvasTexture(c)
        bgTexture.colorSpace = THREE.SRGBColorSpace
        scene.background = bgTexture
      } else if (bg.type === 'image' && bg.image) {
        scene.background = new THREE.Color(bg.color)
        new THREE.TextureLoader().load(bg.image, (t) => {
          if (token !== bgToken) return t.dispose()
          t.colorSpace = THREE.SRGBColorSpace
          bgTexture = t
          scene.background = t
          coverBackground(camera.aspect)
        })
      } else if (bg.type === 'image') scene.background = new THREE.Color(bg.color)
      else scene.background = null
    }

    // --- kamera ---
    let anim: { from: THREE.Vector3; to: THREE.Vector3; tFrom: THREE.Vector3; tTo: THREE.Vector3; t: number } | null = null
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fitDistance = () => Math.max(2, 0.55 / (Math.tan((15 * Math.PI) / 180) * camera.aspect))
    function presetPose(p: CameraPreset | 'reset') {
      const D = fitDistance()
      const collarY = dims.H * 0.45
      const sleeveX = dims.sleeve.x
      const poses: Record<CameraPreset, [number[], number[]]> = {
        front: [[0, 0.05, D], [0, 0, 0]],
        back: [[0, 0.05, -D], [0, 0, 0]],
        left: [[-D, 0.05, 0], [0, 0, 0]],
        right: [[D, 0.05, 0], [0, 0, 0]],
        threeQuarter: [[D * 0.62, 0.25, D * 0.78], [0, 0, 0]],
        collar: [[0, collarY + 0.25, 0.7], [0, collarY - 0.02, 0.03]],
        sleeve: [[sleeveX + 0.75, collarY - 0.02, 0.45], [sleeveX, collarY - 0.12, 0]],
      }
      const [pos, target] = poses[p === 'reset' ? 'front' : p]
      return { pos: new THREE.Vector3(...pos), target: new THREE.Vector3(...target) }
    }
    function goTo(p: CameraPreset | 'reset', instant = false) {
      const pose = presetPose(p)
      if (instant || reduceMotion.matches) {
        camera.position.copy(pose.pos)
        controls.target.copy(pose.target)
        anim = null
        return
      }
      anim = { from: camera.position.clone(), to: pose.pos, tFrom: controls.target.clone(), tTo: pose.target, t: 0 }
    }
    controls.addEventListener('start', () => (anim = null))

    // --- ukuran ---
    function resize() {
      const w = host!.clientWidth
      const h = host!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      coverBackground(camera.aspect)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // --- ekspor ---
    let exporting = false
    viewerApi.exportImage = async (o) => {
      exporting = true
      const prevSize = renderer.getSize(new THREE.Vector2())
      const prevRatio = renderer.getPixelRatio()
      const prevBg = scene.background
      const bgType = store.getState().scene.background.type
      hideGuides = true
      repaint()
      if (o.format === 'png' && o.transparent) scene.background = null
      else if (bgType === 'transparent') scene.background = new THREE.Color(0xffffff)
      renderer.setPixelRatio(1)
      renderer.setSize(o.size, o.size, false)
      camera.aspect = 1
      camera.updateProjectionMatrix()
      coverBackground(1)
      try {
        renderer.render(scene, camera)
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, o.format === 'png' ? 'image/png' : 'image/jpeg', 0.92),
        )
        if (!blob) throw new Error('toBlob gagal')
        return blob
      } finally {
        scene.background = prevBg
        renderer.setPixelRatio(prevRatio)
        renderer.setSize(prevSize.x, prevSize.y, false)
        hideGuides = false
        resize()
        dirty = true
        exporting = false
      }
    }

    // --- konteks hilang ---
    const onLost = (e: Event) => {
      e.preventDefault()
      store.getState().showToast('Tampilan 3D terhenti sebentar. Kami sedang memulihkannya, proyekmu aman.')
    }
    const onRestored = () => {
      store.getState().showToast('Tampilan 3D sudah pulih.')
      dirty = true
    }
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    // --- loop ---
    let last = performance.now()
    let frames = 0
    let windowStart = last
    renderer.setAnimationLoop((now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (anim) {
        anim.t = Math.min(1, anim.t + dt / 0.6)
        const k = ease(anim.t)
        camera.position.lerpVectors(anim.from, anim.to, k)
        controls.target.lerpVectors(anim.tFrom, anim.tTo, k)
        if (anim.t >= 1) anim = null
      }
      controls.update()
      if (dirty) {
        dirty = false
        repaint()
      }
      renderer.render(scene, camera)
      // Turunkan kualitas bila rata-rata di bawah 24 fps selama 3 detik.
      frames++
      if (now - windowStart > 3000) {
        const fps = (frames * 1000) / (now - windowStart)
        const q = store.getState().quality
        if (fps < 24 && q !== 'low' && !document.hidden && !exporting) {
          store.getState().setQuality(QUALITY_DOWN[q])
          store
            .getState()
            .showToast('Kami menurunkan kualitas tampilan supaya tetap lancar di perangkat ini. Kamu bisa mengubahnya di panel Latar dan Cahaya.')
        }
        frames = 0
        windowStart = now
      }
    })

    // --- sinkron dengan store ---
    const initial = store.getState()
    applyQuality(initial.quality)
    void loadModel(model)
    applyColors(initial.garment)
    applyScene(initial.scene)
    goTo('reset', true)

    const unsub = store.subscribe((s, p) => {
      const g = s.garment
      if (g !== p.garment) {
        if (modelOf(g) !== modelOf(p.garment)) void loadModel(modelOf(g))
        else if (g.material !== p.garment.material || g.thickness !== p.garment.thickness) applyFabric(g)
        if (g.colors !== p.garment.colors) applyColors(g)
      }
      if (s.layers !== p.layers || s.selectedId !== p.selectedId || s.showGuides !== p.showGuides) dirty = true
      if (s.scene !== p.scene) applyScene(s.scene, p.scene)
      if (s.quality !== p.quality) applyQuality(s.quality)
      if (s.cameraRequest && s.cameraRequest !== p.cameraRequest) goTo(s.cameraRequest.preset)
    })

    return () => {
      disposed = true
      unsub()
      renderer.setAnimationLoop(null)
      ro.disconnect()
      controls.dispose()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      viewerApi.exportImage = null
      geometries.forEach((geos) => Object.values(geos).forEach((g) => g.dispose()))
      Object.values(outer).forEach((m) => m.dispose())
      Object.values(textures).forEach((t) => t.dispose())
      normalClones.forEach((t) => t.dispose())
      bgTexture?.dispose()
      ground.geometry.dispose()
      scene.environment?.dispose()
      pmrem.dispose()
      renderer.dispose()
      canvas.remove()
    }
  }, [])

  return (
    <>
      <div ref={hostRef} className={styles.viewerHost} />
      {status === 'loading' && (
        <output className={styles.stageMessage}>
          <p>Menyiapkan kaos 3D</p>
        </output>
      )}
      {status === 'error' && (
        <div className={styles.stageMessage} role="alert">
          <p>Kaos 3D belum berhasil dimuat. Periksa koneksi internetmu, lalu tekan Coba Lagi.</p>
          <button type="button" className="btn btn-secondary" onClick={() => retryRef.current()}>
            Coba Lagi
          </button>
        </div>
      )}
    </>
  )
}
