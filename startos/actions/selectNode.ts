import { createDependentCredential } from 'flowee-startos/startos/actions/credentials/dependentCredential'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const selectNode = sdk.Action.withInput(
  'select-node',

  async () => ({
    name: i18n('Select Node Backend'),
    description: i18n(
      'Choose which Bitcoin Cash node the pool gets its block templates from.',
    ),
    warning: i18n(
      'The pool restarts against the new node. If that node is on a different chain, the accumulated share and hashrate figures are cleared, because they do not carry across chains.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  InputSpec.of({
    nodePackageId: Value.select({
      name: i18n('Node Backend'),
      description: i18n(
        'Choose a node you have installed. Blocks found before it has fully synced are rejected by the network.\n- Bitcoin Cash Node: nothing more to set up\n- Bitcoin Cash Daemon: nothing more to set up\n- Flowee the Hub: raises a task on Flowee to register the login the pool uses',
      ),
      default: null,
      values: {
        bitcoincashd: i18n('Bitcoin Cash Node'),
        bchd: i18n('Bitcoin Cash Daemon'),
        flowee: i18n('Flowee the Hub'),
      },
    }),
  }),

  async () => {
    const store = await storeJson.read().once()
    return store?.nodeConfirmed ? { nodePackageId: store.nodePackageId } : null
  },

  async ({ effects, input }) => {
    // `main` reads this selection through a `.const()`, so writing it here is
    // what restarts the pool against the new node.
    await storeJson.merge(effects, {
      nodePackageId: input.nodePackageId,
      nodeConfirmed: true,
    })

    if (input.nodePackageId !== 'flowee') return

    // Flowee keeps only a hash of each RPC password and cannot hand one back,
    // so the credential the pool dials it with is minted in `seedFiles` and has
    // to be registered there. Raised on selection rather than from the
    // dependency's init, which re-runs on every init and would keep asking.
    const store = await storeJson.read().once()
    await sdk.action.createTask(
      effects,
      'flowee',
      createDependentCredential,
      'critical',
      {
        input: {
          kind: 'partial',
          accept: [
            {
              username: store?.floweeRpcUser,
              password: store?.floweeRpcPassword,
            },
          ],
          set: {
            username: store?.floweeRpcUser,
            password: store?.floweeRpcPassword,
          },
        },
        reason: i18n(
          'Flowee needs an RPC credential registered for the pool to log in with',
        ),
      },
    )
  },
)
