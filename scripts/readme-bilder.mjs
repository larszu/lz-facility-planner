// ───────────────────────────────────────────────────────────────────────────
// Die README-Bilder — wiederholbar aufgenommen.
//
// WARUM ES DAS GIBT (2026-10-14): Die Oberfläche wurde auf hell + dunkel
// umgestellt (ADR-007 der Suite, geändert 2026-10-13). Ein Bild, das jemand
// von Hand aufnimmt, zeigt nach dem nächsten Umbau den alten Stand, und
// niemand merkt es. Dieses Skript baut die App, startet `vite preview`, legt
// ein BEISPIEL-Gebäude in den localStorage und nimmt die Hauptansicht in
// beiden Modi auf.
//
// Die Beispieldaten sind erfunden und enthalten keine Anlagen-Adressen —
// dieses Repo ist öffentlich (`keineAnlagenAdressen.node.test.ts`).
//
// Lauf: `npm run bilder`. Braucht einen Chromium: entweder `CHROME=<Pfad>`
// oder ein installiertes Google Chrome (Kanal `chrome`).
// Headless Chrome meldet sonst immer `prefers-color-scheme: dark` — deshalb
// steht `colorScheme` je Aufnahme ausdrücklich da.
// ───────────────────────────────────────────────────────────────────────────
import { spawn, execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const WURZEL = resolve(fileURLToPath(import.meta.url), '..', '..')
const ZIEL = resolve(WURZEL, 'docs', 'bilder')
const PORT = 4295
const URL = `http://localhost:${PORT}/`

const punkt = (id, bezeichnung, raumId, anschlussart, absicherungA, extra = {}) => ({
  id, bezeichnung, art: 'dose', raumId, anschlussart, netzform: 'TN-S',
  absicherungA, charakteristik: 'B', rcdTyp: 'A', ...extra,
})

const BEISPIEL = {
  id: 'haus-1',
  name: 'Stadthalle Nord',
  etagen: [
    { id: 'e0', name: 'Erdgeschoss', hoeheM: 0 },
    { id: 'e1', name: 'Obergeschoss', hoeheM: 4.5 },
  ],
  raeume: [
    { id: 'r-saal', hausbezeichner: 'EG.01', name: 'Großer Saal', etageId: 'e0' },
    { id: 'r-foyer', hausbezeichner: 'EG.02', name: 'Foyer', etageId: 'e0' },
    { id: 'r-regie', hausbezeichner: 'OG.01', name: 'Regie', etageId: 'e1' },
  ],
  punkte: [
    { ...punkt('p0', 'Hauptverteiler Powerlock', 'r-saal', 'powerlock', 125), art: 'einspeisung' },
    punkt('p1', 'Bühne links CEE 32', 'r-saal', 'cee32', 32, { dauerleistungW: 11000 }),
    punkt('p2', 'Bühne rechts CEE 32', 'r-saal', 'cee32', 32),
    punkt('p3', 'Foyer Schuko 1', 'r-foyer', 'schuko', 16),
    punkt('p4', 'Regie Rack', 'r-regie', 'cee16', 16),
  ],
  stromkreise: [], verteilungen: [], klinken: [], strecken: [], trassen: [],
  schaltstellen: [], zuordnungen: [], maengel: [],
}

execSync('npm run build', { cwd: WURZEL, stdio: 'inherit' })
const vorschau = spawn(process.execPath, [resolve(WURZEL, 'node_modules', 'vite', 'bin', 'vite.js'), 'preview', '--port', String(PORT), '--strictPort'], { cwd: WURZEL, stdio: 'ignore' })

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : { channel: 'chrome' })
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(URL)).ok) break } catch { /* startet noch */ }
    await new Promise((r) => setTimeout(r, 200))
  }
  for (const [modus, datei] of [['light', 'hauptansicht-hell.png'], ['dark', 'hauptansicht-dunkel.png']]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 720 }, colorScheme: modus, locale: 'en' })
    await ctx.addInitScript((g) => localStorage.setItem('facility-planner:gebaeude', g), JSON.stringify(BEISPIEL))
    const seite = await ctx.newPage()
    await seite.goto(URL)
    await seite.waitForLoadState('networkidle')
    await seite.screenshot({ path: resolve(ZIEL, datei) })
    await ctx.close()
    console.log(`docs/bilder/${datei}`)
  }
} finally {
  await browser.close()
  vorschau.kill()
}
