import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.4:26',
  releaseNotes: {
    en_US:
      'When mining cannot start, the Mining health check reports why once per start.',
    es_ES:
      'Cuando la minería no puede iniciarse, la comprobación de estado Minería indica el motivo una vez por inicio.',
    de_DE:
      'Wenn das Mining nicht starten kann, nennt die Statusprüfung Mining den Grund einmal pro Start.',
    pl_PL:
      'Gdy kopanie nie może się rozpocząć, kontrola stanu Kopanie podaje przyczynę raz przy każdym uruchomieniu.',
    fr_FR:
      "Lorsque le minage ne peut pas démarrer, la vérification d'état Minage en indique la raison une fois par démarrage.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
