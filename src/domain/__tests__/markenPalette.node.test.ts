import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ───────────────────────────────────────────────────────────────────────────
// ADR-007 der lz-planner-suite — die Marken-Palette, Hell UND Dunkel.
//
// WARUM ES DAS GIBT. Maschinenlesbar stehen die Werte in `@avplan/ui`, aber
// dieses Repo haengt an keinem Paket der Suite: es laeuft eigenstaendig und
// wird vendoriert. Ohne diesen Lauf waere der Rueckweg in eine rohe Palette
// eine Zeile, die niemandem auffaellt — so hat dieses Repo am 2026-09-09
// angefangen (slate).
//
// UMGEBAUT 2026-10-13 (ADR-007 geaendert). Bis dahin mass er Deep Navy als
// Grund, keine Rundungen, keine Schatten, keine Verlaeufe. Der Eigentuemer
// hat die Oberflaeche modernisiert: neutrale Flaechen, Markenblau nur als
// Akzent, beide Modi mit sichtbarem Umschalter, Rundung und Schatten nur
// ueber Tokens. Gemessen werden jetzt die exakten Werte des Design-Vertrags
// in BEIDEN Modi — dieselben wie im cable-planner.
//
// WAS ER MISST: die Token-Datei `src/tokens.css` und dass das Stilblatt
// `src/index.css` keine Farbe, keinen Radius und keinen Schatten an ihr
// vorbei setzt. Er misst NICHT das gerenderte Fenster.
// ───────────────────────────────────────────────────────────────────────────

const lies = (...p: string[]) => readFileSync(resolve(__dirname, '..', '..', ...p), 'utf8')
const OHNE_KOMMENTAR = new RegExp('/\\*[\\s\\S]*?\\*/', 'g')
const tokens = lies('tokens.css').replace(OHNE_KOMMENTAR, '')
const css = lies('index.css').replace(OHNE_KOMMENTAR, '')

const token = (name: string): string => {
  const m = new RegExp('\\s' + name + ':\\s*([^;]+);').exec(tokens)
  return m ? m[1].trim() : ''
}

/** `light-dark(a, b)` → [a, b]; ein Wert ohne Modus gilt in beiden. */
const modi = (name: string): [string, string] => {
  const v = token(name)
  const m = /^light-dark\((.+)\)$/.exec(v)
  if (!m) return [v, v]
  // Am ersten Komma auf Klammer-Ebene 0 trennen — rgba(...) enthaelt selbst Kommas.
  let tiefe = 0
  for (let i = 0; i < m[1].length; i++) {
    const c = m[1][i]
    if (c === '(') tiefe++
    else if (c === ')') tiefe--
    else if (c === ',' && tiefe === 0) return [m[1].slice(0, i).trim(), m[1].slice(i + 1).trim()]
  }
  return [v, v]
}

const norm = (s: string) => s.replace(/\s+/g, '').replace(/0\.(\d)/g, '.$1').toLowerCase()

const VERTRAG: Record<string, [string, string]> = {
  '--bg': ['#FAFAF8', '#1E1F23'],
  '--flaeche': ['#FFFFFF', '#28292E'],
  '--flaeche-2': ['#F1F1EE', '#33343A'],
  '--erhoben': ['#FFFFFF', '#3B3C42'],
  '--versenkt': ['#F4F4F1', '#19191D'],
  '--text-stark': ['#16181D', '#F6F5F0'],
  '--text': ['#2B2E35', '#E6E6E3'],
  '--leise': ['#6A6E77', '#A9ACB4'],
  '--rand': ['rgba(22,24,29,.08)', 'rgba(246,245,240,.09)'],
  '--rand-stark': ['rgba(22,24,29,.18)', 'rgba(246,245,240,.2)'],
  '--akzent': ['#1D324F', '#B9C7D8'],
  '--akzent-text': ['#F6F5F0', '#132040'],
  '--logo': ['#1D324F', '#F6F5F0'],
  '--schein-1': ['rgba(29,50,79,.1)', 'rgba(185,199,216,.16)'],
  '--schein-2': ['rgba(200,137,43,.1)', 'rgba(200,137,43,.1)'],
}

describe('ADR-007: die Werte in beiden Modi', () => {
  for (const [name, [hell, dunkel]] of Object.entries(VERTRAG)) {
    it(`${name} ist ${hell} | ${dunkel}`, () => {
      const [h, d] = modi(name)
      expect(norm(h), `${name} hell`).toBe(norm(hell))
      expect(norm(d), `${name} dunkel`).toBe(norm(dunkel))
    })
  }

  it('die Modi schalten ueber color-scheme: System, hell, dunkel', () => {
    expect(tokens).toMatch(/:root\s*\{\s*color-scheme:\s*light dark;/)
    expect(tokens).toMatch(/:root\[data-thema='hell'\]\s*\{\s*color-scheme:\s*light;/)
    expect(tokens).toMatch(/:root\[data-thema='dunkel'\]\s*\{\s*color-scheme:\s*dark;/)
  })

  it('der Dunkelmodus ist Anthrazit, kein Navy', () => {
    for (const navy of ['#132040', '#1D324F', '#24405F']) {
      for (const f of ['--bg', '--flaeche', '--flaeche-2', '--erhoben']) {
        expect(modi(f)[1].toUpperCase(), `${f} dunkel`).not.toBe(navy)
      }
    }
  })
})

describe('ADR-007: das Signal ist nicht der Status', () => {
  it('Tally-Rot steht genau einmal und allein', () => {
    expect(token('--signal')).toBe('#D6402E')
    expect(tokens.match(/#D6402E/gi)?.length).toBe(1)
    expect(css).not.toMatch(/#D6402E/i)
  })

  it('die Meldefarben sind die des Handbuchs und NICHT Tally-Rot', () => {
    expect(token('--warn')).toBe('#C8892B')
    expect(token('--gefahr')).toBe('#B04A3F')
    expect(token('--ok')).toBe('#2F7D5C')
  })

  it('das Logo haengt an den Kit-Farben, nicht am Akzent', () => {
    expect(token('--logo')).not.toContain('--akzent')
    expect(css).toMatch(/\.signet-form\s*\{\s*fill:\s*var\(--logo\)/)
    expect(css).toMatch(/\.signet-punkt\s*\{\s*fill:\s*var\(--signal\)/)
  })
})

describe('ADR-007: Farbe, Rundung und Schatten nur ueber Tokens', () => {
  it('kein rohes Hex und kein rgb im Stilblatt', () => {
    expect(css.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([])
    expect(css.match(/rgba?\(/gi) ?? []).toEqual([])
  })

  it('border-radius nur var(--r-*) oder 0', () => {
    const roh = [...css.matchAll(/border-radius:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((v) => v !== '0' && !/^var\(--r-(s|m|l|xl|voll)\)$/.test(v))
    expect(roh).toEqual([])
  })

  it('box-shadow nur var(--schatten-*) oder none', () => {
    const roh = [...css.matchAll(/box-shadow:\s*([^;]+);/g)]
      .map((m) => m[1].trim())
      .filter((v) => v !== 'none' && !/^var\(--schatten-[\w-]+\)$/.test(v))
    expect(roh).toEqual([])
  })

  it('keine rohen slate-Farben mehr', () => {
    for (const alt of ['#0f172a', '#1e293b', '#334155', '#e2e8f0', '#94a3b8', '#f59e0b']) {
      expect((tokens + css).toLowerCase().includes(alt), alt).toBe(false)
    }
  })
})

describe('ADR-007: der Umschalter ist sichtbar', () => {
  it('Auto · Hell · Dunkel steht in der Kopfzeile', () => {
    const kopf = lies('ui', 'Kopfzeile.tsx')
    const um = lies('ui', 'ThemaUmschalter.tsx')
    expect(kopf).toContain('<ThemaUmschalter />')
    for (const id of ["'system'", "'hell'", "'dunkel'"]) expect(um).toContain(id)
    expect(um).toContain('aria-pressed')
  })
})

describe('Gegenprobe zum Lauf selbst', () => {
  it('`token` liest wirklich aus der Token-Datei', () => {
    expect(token('--gibt-es-nicht')).toBe('')
    expect(token('--bg')).not.toBe('')
    expect(modi('--bg')[0]).not.toBe(modi('--bg')[1])
  })
})
