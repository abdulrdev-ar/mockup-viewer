'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FABRIC, THICKNESS_NORMAL, fabricNormalTexture } from '@/lib/fabric'
import { PRINT_FONT_FAMILIES } from '@/lib/fonts'
import { loadedImages, onAssetsReady } from '@/lib/print-assets'
import { MODELS, WRAP_H, WRAP_W, bodySections, modelOf, wrapUv, type Dims, type ModelId, type ModelPart } from '@/lib/garment'
import { hitHandle, hitLayer, layerBox, paintWrap, placeLayer, wrapDx } from '@/lib/print'
import type { Layer } from '@/lib/slices/design'
import type { Garment } from '@/lib/slices/garment'
import type { Scene } from '@/lib/slices/scene'
import type { CameraPreset, Quality } from '@/lib/slices/ui'
import { holdHistory, useEditorStore } from '@/lib/store'
import { viewerApi } from '@/lib/viewer-api'
import styles from './editor.module.css'

const PARTS: ModelPart[] = ['body', 'sleeveL', 'sleeveR', 'collar']
const DEG = Math.PI / 180

const LIGHTS = {
  neutral: { env: 0.7, key: 1.4, color: 0xffffff, rim: 0, pos: [-0.9, 3, 1.6] },
  warm: { env: 0.6, key: 1.6, color: 0xffe0bd, rim: 0.3, pos: [-0.9, 3, 1.6] },
  contrast: { env: 0.25, key: 2.8, color: 0xffffff, rim: 1.2, pos: [-2.2, 1.6, 1.2] },
} as const

/** wrap = lebar kanvas cetak (px). Tingginya mengikuti rasio WRAP_H / WRAP_W. */
const QUALITY: Record<Quality, { ratio: number; wrap: number; shadows: boolean }> = {
  high: { ratio: 2, wrap: 4096, shadows: true },
  medium: { ratio: 1.25, wrap: 2048, shadows: true },
  low: { ratio: 1, wrap: 2048, shadows: false },
}
const QUALITY_DOWN: Record<Quality, Quality> = { high: 'medium', medium: 'low', low: 'low' }
const CURSOR = ['nwse-resize', 'nesw-resize', 'nwse-resize', 'nesw-resize', 'grab']

const WHITE = new THREE.Color(0xffffff)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

type Drag = { id: string; pointerId: number; mode: 'move' | 'resize' | 'rotate'; start: { x: number; y: number }; layer: Layer; dist: number }

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
    canvas.setAttribute(
      'aria-label',
      'Pratinjau 3D kaos. Seret gambar atau tulisan untuk memindahkannya, seret kain atau latar untuk memutar, gulir atau cubit untuk memperbesar.',
    )
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

    // Satu kanvas cetak transparan untuk seluruh kaos. Diulang di u karena tengah belakang ada di u = 0 dan 1 (wrapUv).
    const printCanvas = document.createElement('canvas')
    let texture: THREE.CanvasTexture | null = null
    const makeTexture = () => {
      texture?.dispose()
      texture = new THREE.CanvasTexture(printCanvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.wrapS = THREE.RepeatWrapping
      texture.anisotropy = aniso
      // Alfa dikalikan saat unggah supaya tepi cetakan tidak bergaris gelap saat difilter.
      texture.premultiplyAlpha = true
      return texture
    }

    // Model hanya berisi permukaan luar kain. Sisi belakangnya adalah bagian dalam kaos (terlihat dari leher
    // dan ujung lengan): digelapkan dan tanpa cetakan. Warna kain dari material, cetakan dicampur di atasnya.
    const material = () => {
      const m = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide })
      m.onBeforeCompile = (s) => {
        s.fragmentShader = s.fragmentShader.replace(
          '#include <map_fragment>',
          `vec4 printTex = gl_FrontFacing ? texture2D(map, vMapUv) : vec4(0.0);
diffuseColor.rgb = diffuseColor.rgb * (1.0 - printTex.a) + printTex.rgb;
diffuseColor.rgb *= gl_FrontFacing ? 1.0 : 0.62;`,
        )
      }
      return m
    }
    const outer = { body: material(), sleeveL: material(), sleeveR: material(), collar: material() } satisfies Record<ModelPart, THREE.MeshPhysicalMaterial>
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
    /** kanvas cetak perlu digambar ulang */
    let dirty = true
    /** layar perlu dirender ulang */
    let needsRender = true
    let exporting = false
    let disposed = false
    const stopAssets = onAssetsReady(() => (dirty = true))
    const imageError = () => store.getState().showToast('Gambar tidak bisa dibuka. Coba simpan ulang lalu unggah lagi.', 'error')

    // --- model kaos ---
    const loader = new GLTFLoader()
    const geometries = new Map<ModelId, Record<ModelPart, THREE.BufferGeometry>>()
    // Atribut GLB bisa berselang (interleaved), jadi .array tidak bisa dibaca langsung.
    const read = (geo: THREE.BufferGeometry, name: string) => {
      const a = geo.getAttribute(name)
      return Float32Array.from({ length: a.count * a.itemSize }, (_, k) => a.getComponent(Math.floor(k / a.itemSize), k % a.itemSize))
    }
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
          for (const part of PARTS) if (!found[part]) throw new Error(`bagian ${part} tidak ada`)
          const sections = bodySections(read(found.body, 'position'))
          geos = {} as Record<ModelPart, THREE.BufferGeometry>
          for (const part of PARTS) {
            // Segitiga lepas supaya segitiga di tengah belakang bisa punya u sendiri (wrapUv).
            const geo = found[part].index ? found[part].toNonIndexed() : found[part]
            // UV asli dipakai tekstur serat (channel 1), UV bungkus dipakai kanvas cetak (channel 0).
            geo.setAttribute('uv1', geo.getAttribute('uv'))
            geo.setAttribute('uv', new THREE.BufferAttribute(wrapUv(read(geo, 'position'), sections), 2))
            if (geo !== found[part]) found[part].dispose()
            geos[part] = geo
          }
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
        group.updateMatrixWorld()
        applyFabric(store.getState().garment)
        needsRender = true
        setStatus('ready')
      } catch {
        if (!disposed) setStatus('error')
      }
    }
    retryRef.current = () => void loadModel(modelOf(store.getState().garment))

    // --- bahan dan warna ---
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
      needsRender = true
    }

    function applyColors(g: Garment) {
      for (const part of PARTS) {
        outer[part].color.set(g.colors[part])
        // Kilap serat mengikuti warna kain supaya warna gelap tidak tampak berdebu.
        outer[part].sheenColor.set(g.colors[part]).lerp(WHITE, 0.5)
      }
      needsRender = true
    }

    // --- kanvas cetak ---
    const measure = document.createElement('canvas').getContext('2d')
    const boxOf = (l: Layer) => (measure ? layerBox(measure, l, PRINT_FONT_FAMILIES[l.kind === 'text' ? l.font : 'anton']) : { w: 0, h: 0 })
    /** Jari-jari pegangan seleksi (cm) supaya tampak sekitar 9 px (mouse) atau 11 px (sentuh) di layar. Area sentuh 2,2 kali lipat. */
    const coarse = window.matchMedia('(pointer: coarse)')
    let handleR = 1
    const handleRadius = () => {
      const D = camera.position.distanceTo(controls.target)
      const pxPerCm = host!.clientHeight / (2 * D * Math.tan((camera.fov / 2) * DEG)) / 100
      return (coarse.matches ? 11 : 9) / Math.max(pxPerCm, 0.01)
    }

    function repaint() {
      const s = store.getState()
      const ctx = printCanvas.getContext('2d')
      if (!ctx) return
      paintWrap(ctx, {
        layers: s.layers,
        fonts: PRINT_FONT_FAMILIES,
        images: loadedImages(s.layers, imageError),
        selection: !exporting && s.selectedId ? { id: s.selectedId, r: handleR } : null,
      })
      if (texture) texture.needsUpdate = true
    }

    // --- kualitas ---
    function applyQuality(q: Quality) {
      const c = QUALITY[q]
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, c.ratio))
      renderer.shadowMap.enabled = c.shadows
      key.castShadow = c.shadows
      printCanvas.width = c.wrap
      printCanvas.height = Math.round((c.wrap * WRAP_H) / WRAP_W)
      const t = makeTexture()
      for (const part of PARTS) {
        outer[part].map = t
        outer[part].needsUpdate = true
      }
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
      needsRender = true
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
          needsRender = true
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
      needsRender = true
      if (instant || reduceMotion.matches) {
        camera.position.copy(pose.pos)
        controls.target.copy(pose.target)
        anim = null
        return
      }
      anim = { from: camera.position.clone(), to: pose.pos, tFrom: controls.target.clone(), tTo: pose.target, t: 0 }
    }
    controls.addEventListener('start', () => (anim = null))
    // Pegangan seleksi menjaga ukurannya di layar saat diperbesar atau diperkecil.
    controls.addEventListener('change', () => {
      needsRender = true
      const r = handleRadius()
      if (Math.abs(r - handleR) / handleR > 0.15) {
        handleR = r
        if (store.getState().selectedId) dirty = true
      }
    })

    // --- ukuran ---
    function resize() {
      const w = host!.clientWidth
      const h = host!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      coverBackground(camera.aspect)
      handleR = handleRadius()
      needsRender = true
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // --- edit langsung di kaos ---
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    /** Titik kanvas cetak (cm) di bawah koordinat layar, atau null bila tidak mengenai kaos. */
    function pick(clientX: number, clientY: number) {
      const r = canvas.getBoundingClientRect()
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const uv = raycaster.intersectObjects(Object.values(meshes), false)[0]?.uv
      if (!uv) return null
      return { x: (uv.x - Math.floor(uv.x) - 0.5) * WRAP_W, y: (0.5 - uv.y) * WRAP_H }
    }
    viewerApi.aim = (x, y) => {
      const r = canvas.getBoundingClientRect()
      return pick(x ?? r.left + r.width / 2, y ?? r.top + r.height / 2)
    }

    let drag: Drag | null = null
    // Listener fase capture di host berjalan sebelum OrbitControls (di canvas): bila mengenai lapisan,
    // event dihentikan supaya kamera tidak ikut berputar.
    const onDown = (e: PointerEvent) => {
      if (drag) return e.stopPropagation()
      if (e.button !== 0) return
      const p = pick(e.clientX, e.clientY)
      const s = store.getState()
      const sel = s.layers.find((l) => l.id === s.selectedId)
      let target: Layer | undefined
      let mode: Drag['mode'] = 'move'
      if (p && sel) {
        const h = hitHandle(sel, boxOf(sel), handleR, p, e.pointerType === 'mouse' ? 1.4 : 2.2)
        if (h >= 0) {
          target = sel
          mode = h === 4 ? 'rotate' : 'resize'
        }
      }
      if (!target && p) target = hitLayer(s.layers, boxOf, p)
      if (!target || !p) {
        if (sel) s.selectLayer(null)
        return
      }
      e.stopPropagation()
      if (target.id !== s.selectedId) s.selectLayer(target.id)
      holdHistory(true)
      drag = { id: target.id, pointerId: e.pointerId, mode, start: p, layer: target, dist: Math.max(0.1, Math.hypot(wrapDx(p.x - target.x), p.y - target.y)) }
      canvas.setPointerCapture(e.pointerId)
    }
    let hover: { x: number; y: number } | null = null
    const onMove = (e: PointerEvent) => {
      if (!drag) {
        if (e.pointerType === 'mouse' && e.buttons === 0) hover = { x: e.clientX, y: e.clientY }
        return
      }
      e.stopPropagation()
      if (e.pointerId !== drag.pointerId) return
      const p = pick(e.clientX, e.clientY)
      if (!p) return
      const s = store.getState()
      const l = drag.layer
      if (drag.mode === 'move') return s.updateLayer(l.id, placeLayer(l.x + wrapDx(p.x - drag.start.x), l.y + p.y - drag.start.y))
      if (drag.mode === 'resize') {
        const k = Math.hypot(wrapDx(p.x - l.x), p.y - l.y) / drag.dist
        if (l.kind === 'image') s.updateLayer(l.id, { width: Math.min(WRAP_W, Math.max(1, l.width * k)) })
        else s.updateLayer(l.id, { size: Math.min(30, Math.max(0.5, l.size * k)) })
        return
      }
      // Pegangan putar ada di atas kotak, jadi sudut 0 = pointer tepat di atas pusat. Menempel ke kelipatan 45° dalam 4°.
      let deg = Math.atan2(p.y - l.y, wrapDx(p.x - l.x)) / DEG + 90
      deg = ((deg + 540) % 360) - 180
      const snap = Math.round(deg / 45) * 45
      s.updateLayer(l.id, { rotation: Math.abs(deg - snap) < 4 ? snap : Math.round(deg) })
    }
    const onUp = (e: PointerEvent) => {
      if (!drag) return
      e.stopPropagation()
      if (e.pointerId !== drag.pointerId) return
      drag = null
      holdHistory(false)
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
    }
    const onDouble = (e: MouseEvent) => {
      const p = pick(e.clientX, e.clientY)
      const l = p && hitLayer(store.getState().layers, boxOf, p)
      if (l?.kind === 'text') document.getElementById('layer-text')?.focus()
    }
    host.addEventListener('pointerdown', onDown, true)
    host.addEventListener('pointermove', onMove, true)
    host.addEventListener('pointerup', onUp, true)
    host.addEventListener('pointercancel', onUp, true)
    host.addEventListener('dblclick', onDouble)

    function updateCursor() {
      const at = hover
      hover = null
      if (!at) return
      const p = pick(at.x, at.y)
      const s = store.getState()
      const sel = s.layers.find((l) => l.id === s.selectedId)
      const h = p && sel ? hitHandle(sel, boxOf(sel), handleR, p, 1.4) : -1
      canvas.style.cursor = h >= 0 ? CURSOR[h] : p && hitLayer(s.layers, boxOf, p) ? 'move' : ''
    }

    // --- ekspor ---
    viewerApi.exportImage = async (o) => {
      exporting = true
      const prevSize = renderer.getSize(new THREE.Vector2())
      const prevRatio = renderer.getPixelRatio()
      const prevBg = scene.background
      const bgType = store.getState().scene.background.type
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
        const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, o.format === 'png' ? 'image/png' : 'image/jpeg', 0.92))
        if (!blob) throw new Error('toBlob gagal')
        return blob
      } finally {
        scene.background = prevBg
        renderer.setPixelRatio(prevRatio)
        renderer.setSize(prevSize.x, prevSize.y, false)
        exporting = false
        resize()
        dirty = true
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

    // --- loop: hanya merender saat ada yang berubah ---
    let last = performance.now()
    let frames = 0
    let busy = 0
    renderer.setAnimationLoop((now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (anim) {
        anim.t = Math.min(1, anim.t + dt / 0.6)
        const k = ease(anim.t)
        camera.position.lerpVectors(anim.from, anim.to, k)
        controls.target.lerpVectors(anim.tFrom, anim.tTo, k)
        if (anim.t >= 1) anim = null
        needsRender = true
      }
      controls.update()
      updateCursor()
      if (dirty) {
        dirty = false
        repaint()
        needsRender = true
      }
      if (!needsRender) return
      needsRender = false
      renderer.render(scene, camera)
      // Turunkan kualitas bila rata-rata di bawah 24 fps selama 3 detik render.
      frames++
      busy += dt
      if (busy > 3) {
        const fps = frames / busy
        const q = store.getState().quality
        if (fps < 24 && q !== 'low' && !document.hidden && !exporting) {
          store.getState().setQuality(QUALITY_DOWN[q])
          store
            .getState()
            .showToast('Kami menurunkan kualitas tampilan supaya tetap lancar di perangkat ini. Kamu bisa mengubahnya di panel Latar dan Cahaya.')
        }
        frames = 0
        busy = 0
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
      if (s.layers !== p.layers || s.selectedId !== p.selectedId) dirty = true
      if (s.scene !== p.scene) applyScene(s.scene, p.scene)
      if (s.quality !== p.quality) applyQuality(s.quality)
      if (s.cameraRequest && s.cameraRequest !== p.cameraRequest) goTo(s.cameraRequest.preset)
    })

    return () => {
      disposed = true
      stopAssets()
      unsub()
      renderer.setAnimationLoop(null)
      ro.disconnect()
      controls.dispose()
      host.removeEventListener('pointerdown', onDown, true)
      host.removeEventListener('pointermove', onMove, true)
      host.removeEventListener('pointerup', onUp, true)
      host.removeEventListener('pointercancel', onUp, true)
      host.removeEventListener('dblclick', onDouble)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      viewerApi.exportImage = null
      viewerApi.aim = null
      geometries.forEach((geos) => Object.values(geos).forEach((g) => g.dispose()))
      Object.values(outer).forEach((m) => m.dispose())
      texture?.dispose()
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
