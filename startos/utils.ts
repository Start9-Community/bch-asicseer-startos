import { FileHelper, T, utils, z } from '@start9labs/start-sdk'
import {
  rpcPlaintextHostId as bchdRpcHostId,
  rpcPlaintextPort as bchdRpcPort,
} from 'bitcoin-cash-daemon-startos/startos/utils'
import { networkPorts as bchnNetworkPorts } from 'bitcoin-cash-node-startos/startos/utils'
import {
  rpcHostId as floweeRpcHostId,
  rpcPort as floweeRpcPort,
} from 'flowee-startos/startos/utils'
import { sdk } from './sdk'

export const poolPort = 3334
export const uiPort = 81

export const poolInterfaceId = 'pool-mining'
export const uiInterfaceId = 'web-ui'

/** ASICSeer's own volume, as seen inside every subcontainer. */
export const rootDir = '/data'

export const NODE_IDS = ['bitcoincashd', 'bchd', 'flowee'] as const
export type NodeId = (typeof NODE_IDS)[number]

/** Where the selected node's `public` volume is mounted, read-only, in this package's own container. */
const nodePublicMountpoint = '/mnt/node-public'

export const nodeRpcJson = FileHelper.json(
  `${nodePublicMountpoint}/rpc/rpc.json`,
  z.looseObject({
    network: z.string().optional().catch(undefined),
    fullySynced: z.boolean().optional().catch(undefined),
    rpcUser: z.string().optional().catch(undefined),
    rpcPassword: z.string().optional().catch(undefined),
  }),
)

/**
 * The chain the selected node is on and, on BCHN and BCHD, its RPC login, as
 * the node publishes them on its `public` volume — or `null` while it is not
 * installed, predates `public`, or has not written them yet. Every read is
 * `.const()`, so `main` re-runs the moment any of that changes.
 */
export const readNodeRpc = async (effects: T.Effects, node: NodeId) => {
  const publishes = await sdk
    .getServiceManifest(effects, node, (m) => !!m?.volumes.includes('public'))
    .const()
  if (!publishes) return null
  const mountPublic = () =>
    sdk.mount(effects, {
      location: nodePublicMountpoint,
      // The node packages publish this volume but don't export its id.
      target: {
        packageId: node,
        volumeId: 'public',
        subpath: null,
        readonly: true,
        idmap: [],
      },
    })
  try {
    await mountPublic()
  } catch {
    // Subscribe before retrying, so a volume that appears in between still re-runs `main`.
    await utils.Watchable.combine(
      effects,
      [sdk.getStatus(effects, { packageId: node })],
      ([status]) =>
        status ? { desired: status.desired, started: status.started } : null,
    ).const()
    try {
      await mountPublic()
    } catch {
      return null
    }
  }
  const rpc = await nodeRpcJson
    .read(({ network, rpcUser, rpcPassword }) => ({
      network,
      rpcUser,
      rpcPassword,
    }))
    .const(effects)
  return rpc?.network ? { ...rpc, network: rpc.network } : null
}

/** The chains a node can report. `main` wipes the pool's stats when it moves. */
export const NETWORKS = [
  'mainnet',
  'testnet3',
  'testnet4',
  'scalenet',
  'chipnet',
  'regtest',
] as const
export type Network = (typeof NETWORKS)[number]

/** Flowee spells testnet3 `testnet`; every other chain name agrees across the three nodes. */
export const nodeNetwork = (reported: string): Network | null => {
  const name = reported === 'testnet' ? 'testnet3' : reported
  return NETWORKS.includes(name as Network) ? (name as Network) : null
}

/**
 * Which binding each node publishes the JSON-RPC on. BCHN remaps its port per
 * chain; BCHD and Flowee are fixed. BCHD is dialed through its plaintext proxy
 * so no certificate has to be trusted here.
 */
const RPC_BINDINGS: Record<
  NodeId,
  { hostId: string; port: (network: Network) => number; ssl?: boolean }
> = {
  bitcoincashd: {
    // BCHN exports no host ids; its `interfaces.ts` uses this literal.
    hostId: 'rpc',
    port: (network) => bchnNetworkPorts[network].rpc,
    ssl: false,
  },
  bchd: { hostId: bchdRpcHostId, port: () => bchdRpcPort },
  flowee: { hostId: floweeRpcHostId, port: () => floweeRpcPort, ssl: false },
}

/**
 * The selected node's JSON-RPC bridge address. `null` while the node is absent,
 * which `main` reports as a failing health check; the `.const()` heals when it
 * appears. It does not signal a chain change — a binding the node moves off is
 * left disabled, and a disabled binding still resolves.
 */
export const nodeRpcBridge = (
  effects: T.Effects,
  node: NodeId,
  network: Network,
) => {
  const { hostId, port, ssl } = RPC_BINDINGS[node]
  return sdk.host
    .getBridgeAddress(effects, {
      packageId: node,
      hostId,
      internalPort: port(network),
      ssl,
    })
    .const()
}
