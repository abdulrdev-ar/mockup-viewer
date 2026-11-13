'use client'

import { useId, useState } from 'react'
import styles from './editor.module.css'

export function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <section className={styles.section}>
      <h3 className={`label ${styles.sectionTitle}`}>{title}</h3>
      {children}
      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}

/** Grup radio native: Tab masuk grup, panah berpindah pilihan. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const name = useId()
  return (
    <fieldset className={styles.segmented}>
      <legend className="sr-only">{label}</legend>
      {options.map((o) => (
        <label key={o.value} className={styles.segment}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => String(v),
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const id = useId()
  return (
    <div className={styles.slider}>
      <div className={styles.sliderHead}>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="label">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

const HEX = /^#[0-9a-f]{6}$/i

/** Pemilih warna native + kolom kode heksadesimal yang divalidasi saat selesai mengetik. */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (hex: string) => void }) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const invalid = draft !== null && !HEX.test(draft)
  const commit = () => {
    if (draft === null) return
    if (HEX.test(draft)) onChange(draft.toUpperCase())
    else return
    setDraft(null)
  }
  return (
    <div className={styles.colorField}>
      <input
        type="color"
        aria-label={`${label}, pemilih warna`}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
      />
      <div className={styles.hexWrap}>
        <label htmlFor={id} className="label">
          {label}
        </label>
        <input
          id={id}
          className={styles.input}
          value={draft ?? value}
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-err` : undefined}
          onChange={(e) => setDraft(e.target.value.trim())}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
        {invalid && (
          <p id={`${id}-err`} role="alert" className={styles.fieldError}>
            Kode warna belum valid. Contoh: #1F2937
          </p>
        )}
      </div>
    </div>
  )
}
