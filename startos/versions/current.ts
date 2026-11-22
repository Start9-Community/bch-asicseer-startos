import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.4:30',
  releaseNotes: {
    en_US:
      'Dashboard update: other websites open in your browser can no longer remove workers from the dashboard or read its statistics. Workers named with an underscore (bitcoincash:q…_rig1) now show their name, appear under My Devices, and can be deleted.',
    es_ES:
      'Actualización del panel: otros sitios web abiertos en su navegador ya no pueden eliminar trabajadores del panel ni leer sus estadísticas. Los trabajadores nombrados con un guion bajo (bitcoincash:q…_rig1) ahora muestran su nombre, aparecen en My Devices y se pueden eliminar.',
    de_DE:
      'Dashboard-Update: Andere in Ihrem Browser geöffnete Websites können keine Worker mehr aus dem Dashboard entfernen und seine Statistiken nicht mehr lesen. Worker, die mit einem Unterstrich benannt sind (bitcoincash:q…_rig1), zeigen jetzt ihren Namen, erscheinen unter My Devices und lassen sich löschen.',
    pl_PL:
      'Aktualizacja panelu: inne strony otwarte w przeglądarce nie mogą już usuwać koparek z panelu ani odczytywać jego statystyk. Koparki nazwane z podkreślnikiem (bitcoincash:q…_rig1) pokazują teraz swoją nazwę, pojawiają się w My Devices i można je usunąć.',
    fr_FR:
      'Mise à jour du tableau de bord : les autres sites ouverts dans votre navigateur ne peuvent plus supprimer de mineurs du tableau de bord ni lire ses statistiques. Les mineurs nommés avec un tiret bas (bitcoincash:q…_rig1) affichent désormais leur nom, apparaissent dans My Devices et peuvent être supprimés.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
