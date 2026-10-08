import { T } from '@start9labs/start-sdk'
import { storeJson } from './fileModels/store.json'
import {
  bchdDescription,
  bitcoincashdDescription,
  floweeDescription,
} from './manifest/i18n'
import { sdk } from './sdk'
import { NodeId } from './utils'

const selected = async (effects: T.Effects, node: NodeId) =>
  ((await storeJson.read((s) => s.nodePackageId).const(effects)) ??
    'bitcoincashd') === node

// Gated on the node being up, not synced — `node-status` reports the latter,
// which is more use than refusing to start for the days a sync takes.
const bitcoincashd = sdk.Dependency.optional('bitcoincashd', {
  description: bitcoincashdDescription,
  metadata: {
    title: 'Bitcoin Cash Node',
    icon: 'https://raw.githubusercontent.com/Start9-Community/bitcoin-cash-node-startos/master/icon.png',
  },
  versionRange: '>=29.0.0:11',
  kind: 'running',
  healthChecks: ['primary'],
  enabled: async ({ effects }) => selected(effects, 'bitcoincashd'),
})

const bchd = sdk.Dependency.optional('bchd', {
  description: bchdDescription,
  metadata: {
    title: 'Bitcoin Cash Daemon',
    icon: 'https://raw.githubusercontent.com/Start9-Community/bitcoin-cash-daemon-startos/master/icon.png',
  },
  versionRange: '>=0.22.2:0',
  kind: 'running',
  // Dialed through BCHD's plaintext proxy, not its self-signed TLS RPC, so
  // the proxy is the binding that has to be up.
  healthChecks: ['rpc-plaintext'],
  enabled: async ({ effects }) => selected(effects, 'bchd'),
})

// Flowee's credential task is raised by Select Node Backend: Flowee keeps only
// a hash and reports no current input, so raising it from here would re-raise
// it on every init.
const flowee = sdk.Dependency.optional('flowee', {
  description: floweeDescription,
  metadata: {
    title: 'Flowee the Hub',
    icon: 'https://raw.githubusercontent.com/Start9-Community/flowee-the-hub-startos/master/icon.png',
  },
  versionRange: '>=2026.5.2:12',
  kind: 'running',
  healthChecks: ['primary'],
  enabled: async ({ effects }) => selected(effects, 'flowee'),
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(bitcoincashd)
  .addDependency(bchd)
  .addDependency(flowee)
