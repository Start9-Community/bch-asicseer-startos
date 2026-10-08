import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.5.4:25',
  releaseNotes: {
    en_US: `- Requires Bitcoin Cash Node 29.0.0:11 or later.
- Select Node Backend preselects nothing until you have chosen a node, and its description says what each node needs.
- Configure's Payout Address and the prompts for it say that it receives your pool fee.`,
    es_ES: `- Requiere Bitcoin Cash Node 29.0.0:11 o posterior.
- Seleccionar nodo no preselecciona nada hasta que haya elegido un nodo, y su descripción indica qué necesita cada nodo.
- La dirección de pago de Configurar y los avisos que la piden indican que recibe su comisión del pool.`,
    de_DE: `- Erfordert Bitcoin Cash Node 29.0.0:11 oder neuer.
- Knoten auswählen gibt nichts vor, bis Sie einen Knoten gewählt haben, und die Beschreibung nennt, was jeder Knoten braucht.
- Die Auszahlungsadresse unter Konfigurieren und die Aufforderungen dazu sagen, dass sie Ihre Poolgebühr erhält.`,
    pl_PL: `- Wymaga Bitcoin Cash Node 29.0.0:11 lub nowszego.
- Wybierz węzeł nie zaznacza niczego, dopóki nie wybierzesz węzła, a jego opis mówi, czego potrzebuje każdy węzeł.
- Adres wypłaty w Konfiguruj i prośby o jego ustawienie mówią, że trafia na niego Twoja prowizja.`,
    fr_FR: `- Nécessite Bitcoin Cash Node 29.0.0:11 ou une version ultérieure.
- Sélectionner le nœud ne présélectionne rien tant que vous n'avez pas choisi de nœud, et sa description indique ce dont chaque nœud a besoin.
- L'adresse de paiement de Configurer et les demandes qui s'y rapportent indiquent qu'elle reçoit vos frais de pool.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
