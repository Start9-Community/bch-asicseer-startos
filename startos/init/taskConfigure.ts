import { configure } from '../actions/configure'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// A pool with no payout address cannot mine — it builds no coinbase without
// one — so the address is asked for up front rather than left to be
// discovered from a failing health check after the first start.
export const taskConfigure = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await sdk.action.createOwnTask(effects, configure, 'critical', {
    reason: i18n('Set the address your pool fee is paid to'),
  })
})
