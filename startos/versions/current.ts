import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.4:31',
  releaseNotes: {
    en_US: `- ASICSeer no longer has access to its node’s data volume: it reads only the network and RPC login the node publishes for its dependents, and follows a change to either at once.
- While its node is not installed or is older than Bitcoin Cash Node 29.0.0:17, Bitcoin Cash Daemon 0.22.2:8 or Flowee the Hub 2026.5.2:19, ASICSeer does not start and says so; it starts by itself once the node is updated. Update your node first.
- The pool rejects a payout address or miner username whose checksum is wrong or that belongs to another chain.
- The dashboard no longer publishes raw share-log entries or the node’s full RPC replies, and the share logs no longer grow without limit.
- Wipe Mining State’s warning now says that it also erases the found-block list and miners’ unpaid payout credit.`,
    es_ES: `- ASICSeer ya no tiene acceso al volumen de datos de su nodo: solo lee la red y el inicio de sesión RPC que el nodo publica para sus dependientes, y sigue al instante cualquier cambio en ellos.
- Mientras su nodo no esté instalado o sea anterior a Bitcoin Cash Node 29.0.0:17, Bitcoin Cash Daemon 0.22.2:8 o Flowee the Hub 2026.5.2:19, ASICSeer no se inicia y lo indica; se inicia solo en cuanto el nodo se actualiza. Actualice primero su nodo.
- El pool rechaza una dirección de pago o un nombre de usuario de minero cuyo checksum es incorrecto o que pertenece a otra cadena.
- El panel ya no publica entradas sin procesar del registro de shares ni las respuestas RPC completas del nodo, y los registros de shares ya no crecen sin límite.
- La advertencia de Borrar el estado de minería ahora indica que también borra la lista de bloques encontrados y el crédito de pago pendiente de los mineros.`,
    de_DE: `- ASICSeer hat keinen Zugriff mehr auf das Datenvolume seines Knotens: Es liest nur das Netzwerk und die RPC-Anmeldung, die der Knoten für abhängige Dienste veröffentlicht, und folgt einer Änderung daran sofort.
- Solange sein Knoten nicht installiert oder älter als Bitcoin Cash Node 29.0.0:17, Bitcoin Cash Daemon 0.22.2:8 oder Flowee the Hub 2026.5.2:19 ist, startet ASICSeer nicht und meldet das; sobald der Knoten aktualisiert ist, startet es von selbst. Aktualisieren Sie zuerst Ihren Knoten.
- Der Pool lehnt eine Auszahlungsadresse oder einen Miner-Benutzernamen ab, dessen Prüfsumme falsch ist oder der zu einer anderen Chain gehört.
- Das Dashboard veröffentlicht keine rohen Share-Log-Einträge und keine vollständigen RPC-Antworten des Knotens mehr, und die Share-Logs wachsen nicht mehr unbegrenzt.
- Die Warnung von Mining-Statistiken löschen weist jetzt darauf hin, dass auch die Liste gefundener Blöcke und das noch nicht ausbezahlte Guthaben der Miner gelöscht werden.`,
    pl_PL: `- ASICSeer nie ma już dostępu do woluminu danych swojego węzła: odczytuje tylko sieć i dane logowania RPC, które węzeł publikuje dla usług zależnych, i od razu podąża za ich zmianą.
- Dopóki jego węzeł nie jest zainstalowany lub jest starszy niż Bitcoin Cash Node 29.0.0:17, Bitcoin Cash Daemon 0.22.2:8 lub Flowee the Hub 2026.5.2:19, ASICSeer nie uruchamia się i o tym informuje; uruchamia się sam po aktualizacji węzła. Najpierw zaktualizuj węzeł.
- Pula odrzuca adres wypłaty lub nazwę użytkownika koparki z błędną sumą kontrolną albo należące do innego łańcucha.
- Panel nie publikuje już surowych wpisów dziennika udziałów ani pełnych odpowiedzi RPC węzła, a dzienniki udziałów nie rosną już bez ograniczeń.
- Ostrzeżenie akcji Wyczyść stan kopania informuje teraz, że usuwa ona też listę znalezionych bloków i niewypłacone środki koparek.`,
    fr_FR: `- ASICSeer n’a plus accès au volume de données de son nœud : il lit seulement le réseau et l’identifiant RPC que le nœud publie pour ses dépendants, et suit aussitôt tout changement de l’un ou de l’autre.
- Tant que son nœud n’est pas installé ou est antérieur à Bitcoin Cash Node 29.0.0:17, Bitcoin Cash Daemon 0.22.2:8 ou Flowee the Hub 2026.5.2:19, ASICSeer ne démarre pas et l’indique ; il démarre de lui-même une fois le nœud mis à jour. Mettez d’abord votre nœud à jour.
- Le pool refuse une adresse de paiement ou un nom d’utilisateur de mineur dont la somme de contrôle est fausse ou qui appartient à une autre chaîne.
- Le tableau de bord ne publie plus d’entrées brutes du journal des shares ni les réponses RPC complètes du nœud, et les journaux de shares ne grossissent plus sans limite.
- L’avertissement de Effacer l’état de minage indique désormais qu’il efface aussi la liste des blocs trouvés et le crédit de paiement non versé des mineurs.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
