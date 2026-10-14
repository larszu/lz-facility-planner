// ───────────────────────────────────────────────────────────────────────────
// Hell oder dunkel — und wer es entscheidet.
//
// Drei Zustände und nicht zwei, und das ist der Punkt: `system` ist KEIN
// Synonym für „dunkel". Wer das Betriebssystem auf hell stellt, will die App
// hell — und eine App, die das ignoriert, weil sie nur `dark`/`light` kennt,
// hat die Angabe des Hauses überschrieben.
//
// Gespeichert wird nur die ENTSCHEIDUNG, nicht ihr Ergebnis: bei `system`
// steht `system` im Speicher und nicht das, was das System heute sagt. Sonst
// friert die erste Messung ein, und ein späterer Wechsel am Betriebssystem
// käme nie an.
//
// Seit 2026-10-13 steht der Umschalter sichtbar in der Kopfzeile UND in den
// Einstellungen (ADR-007, geändert). Zwei Stellen, ein Zustand: beide lesen
// über `useThema`, sonst zeigte die Kopfzeile nach einer Wahl im Dialog noch
// die alte.
// ───────────────────────────────────────────────────────────────────────────
import { useSyncExternalStore } from 'react'

export type Thema = 'system' | 'hell' | 'dunkel'

// Eigener Schluessel neben `STORAGE_KEYS` und nicht darin: das dort ist das
// GEBAEUDE und was zu ihm gehoert. Eine Ansichts-Vorliebe gehoert dem Geraet,
// nicht dem Haus — sie wandert nicht in die `.avfacility`-Datei.
const SCHLUESSEL = 'facility-planner:thema'

const hoerer = new Set<() => void>()

export const liesThema = (): Thema => {
  try {
    const v = localStorage.getItem(SCHLUESSEL)
    return v === 'hell' || v === 'dunkel' ? v : 'system'
  } catch {
    // Privates Fenster, gesperrte Seitendaten: die Vorgabe ist `system`.
    return 'system'
  }
}

/** Schreibt die Entscheidung an den Wurzelknoten; das Stilblatt liest sie. */
export const wendeAn = (t: Thema): void => {
  const w = document.documentElement
  if (t === 'system') w.removeAttribute('data-thema')
  else w.setAttribute('data-thema', t)
}

let aktuell: Thema | null = null

export const setzeThema = (t: Thema): void => {
  try {
    localStorage.setItem(SCHLUESSEL, t)
  } catch {
    /* siehe oben */
  }
  aktuell = t
  wendeAn(t)
  hoerer.forEach((h) => h())
}

const abonniere = (h: () => void) => {
  hoerer.add(h)
  return () => hoerer.delete(h)
}

const stand = (): Thema => (aktuell ??= liesThema())

export const useThema = (): Thema => useSyncExternalStore(abonniere, stand, stand)
