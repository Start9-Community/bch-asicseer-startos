import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.4:29',
  releaseNotes: {
    en_US:
      "Packaging update: the asicseer-pool source is checked against the exact release and its developer's signature before it is built. Nothing changes in how the pool runs.",
    es_ES:
      'Actualización del empaquetado: el código fuente de asicseer-pool se verifica contra la versión exacta y la firma de su desarrollador antes de compilarse. No cambia nada en el funcionamiento del pool.',
    de_DE:
      'Paketierungs-Update: Der Quellcode von asicseer-pool wird vor dem Bauen gegen die exakte Version und die Signatur des Entwicklers geprüft. An der Funktionsweise des Pools ändert sich nichts.',
    pl_PL:
      'Aktualizacja pakietu: kod źródłowy asicseer-pool jest sprawdzany względem dokładnego wydania i podpisu jego twórcy przed kompilacją. Działanie kopalni się nie zmienia.',
    fr_FR:
      "Mise à jour de l'empaquetage : le code source d'asicseer-pool est vérifié par rapport à la version exacte et à la signature de son développeur avant d'être compilé. Rien ne change dans le fonctionnement du pool.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
