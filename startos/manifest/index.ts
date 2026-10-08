import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bch-asicseer',
  title: 'ASICSeer',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Start9-Community/bch-asicseer-startos',
  upstreamRepo: 'https://github.com/cculianu/asicseer-pool',
  marketingUrl: 'https://github.com/cculianu/asicseer-pool',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    asicseer: {
      source: { dockerBuild: {} },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
