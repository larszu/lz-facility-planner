// Auto · Hell · Dunkel als Segment mit drei Zeichen — sichtbar in der
// Kopfzeile (ADR-007, geändert 2026-10-13). Dieselbe Komponente steht in den
// Einstellungen; beide hängen am selben Zustand (`useThema`).
import type { ReactElement } from 'react'
import { setzeThema, useThema, type Thema } from '../lib/thema'
import { useT } from '../i18n'

const ZEICHEN: Record<Thema, ReactElement> = {
  system: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
  hell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dunkel: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
}

export function ThemaUmschalter() {
  const { t } = useT()
  const thema = useThema()
  const wahl: { id: Thema; titel: string }[] = [
    { id: 'system', titel: t('settings.theme.system', 'Follow the system') },
    { id: 'hell', titel: t('settings.theme.light', 'Light') },
    { id: 'dunkel', titel: t('settings.theme.dark', 'Dark') },
  ]
  return (
    <div className="themen" role="group" aria-label={t('settings.theme', 'Theme')}>
      {wahl.map((w) => (
        <button
          key={w.id}
          type="button"
          aria-pressed={thema === w.id}
          aria-label={w.titel}
          title={w.titel}
          onClick={() => setzeThema(w.id)}
        >
          {ZEICHEN[w.id]}
        </button>
      ))}
    </div>
  )
}
