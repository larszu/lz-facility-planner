// ───────────────────────────────────────────────────────────────────────────
// Die Einstellungen — rechts aussen in der Kopfzeile, wie im Cable Planner.
//
// WAS DRIN STEHT:
//
//   Sprache   Englisch (Quelle) oder Deutsch (Übersetzung). Seit dem
//             2026-09-11, Nutzer-Entscheidung: „Die Standard Sprache muss
//             immer Englisch sein und über i18n muss man auf deutsch
//             übersetzen können."
//
//             Davor stand hier, warum es die Sprache NICHT gibt: dieses Repo
//             sei deutsch-quellig und habe keine i18n-Schicht, ein
//             Umschalter mit nur einer Sprache wäre ein PLACEHOLDER. Der
//             Einwand war richtig — er beschrieb die fehlende Schicht, nicht
//             eine Entscheidung gegen sie. Jetzt gibt es die Schicht, und
//             damit hat der Umschalter etwas zu schalten.
//   Thema     hell / dunkel / dem System folgen. Drei Zustände, weil
//             „System" keine Umschreibung für „dunkel" ist.
//   Über      Name und Version. Die Version kommt aus `__APP_VERSION__`
//             (Vite-Define) und steht nirgends im Quelltext ein zweites Mal.
//
// Seit 2026-10-13 (ADR-007, geändert): der Dialog ist ein schwebendes Blatt
// mit Rundung und Schatten, ohne Kopflinie; Aktionen unten rechts.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { useT, type Sprache } from '../i18n'
import { ThemaUmschalter } from './ThemaUmschalter'
import hauptlogo from '../assets/brand/lzm_hauptlogo_navy.svg'

/** Die Sprachen stehen in IHRER EIGENEN Sprache — „Deutsch", nicht „German".
 *  Wer die Oberfläche gerade nicht versteht, sucht sein eigenes Wort. */
const SPRACHEN: { id: Sprache; titel: string }[] = [
  { id: 'en', titel: 'English' },
  { id: 'de', titel: 'Deutsch' },
]

export function Einstellungen({ onClose }: { onClose: () => void }) {
  const { t, sprache, setzeSprache } = useT()

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  return (
    // Klick auf den Hintergrund schliesst — hier ohne Rueckfrage, weil in
    // diesem Dialog nichts ungesichert steht: jede Wahl wirkt sofort.
    <div className="dialog-hinter" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-label={t('settings.title', 'Settings')}>
        <header className="dialog-kopf">
          <h2>{t('settings.title', 'Settings')}</h2>
          <button type="button" className="dialog-zu" onClick={onClose} aria-label={t('settings.close', 'Close')}>
            ×
          </button>
        </header>
        <div className="dialog-rumpf">
          <section>
            <h3>{t('settings.language', 'Language')}</h3>
            <p className="leise">
              {t(
                'settings.language.hint',
                'English is the source language; German is a translation. A missing entry falls back to English.',
              )}
            </p>
            {SPRACHEN.map((s) => (
              <label key={s.id} className="wahl">
                <input
                  type="radio"
                  name="sprache"
                  checked={sprache === s.id}
                  onChange={() => setzeSprache(s.id)}
                />
                <span>{s.titel}</span>
              </label>
            ))}
          </section>
          <section>
            <h3>{t('settings.theme', 'Theme')}</h3>
            <p className="leise">
              {t('settings.theme.hint', 'Follow the system, always light or always dark. The choice is kept on this device.')}
            </p>
            <ThemaUmschalter />
          </section>
          <section>
            <h3>{t('settings.about', 'About')}</h3>
            {/* Das Hauptlogo als Maske, gefuellt mit `--logo`: so steht es
                in den Kit-Farben beider Themen, ohne zwei Bilder. */}
            <span
              className="ueber-logo"
              role="img"
              aria-label="Lars Zumpe Medienproduktion"
              style={{ maskImage: `url(${hauptlogo})`, WebkitMaskImage: `url(${hauptlogo})` }}
            />
            <p>LZ Facility Planner</p>
            <p className="leise">{t('settings.about.version', 'Version')} {__APP_VERSION__}</p>
            <p className="leise">Lars Zumpe Medienproduktion</p>
            <p className="leise">{t('settings.about.body', 'The building tool of the LZ Planner Suite (ADR-006).')}</p>
          </section>
        </div>
        <footer className="dialog-fuss">
          <button type="button" className="knopf-haupt" onClick={onClose}>
            {t('settings.close', 'Close')}
          </button>
        </footer>
      </div>
    </div>
  )
}
