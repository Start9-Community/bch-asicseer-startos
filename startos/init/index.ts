import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { versionGraph } from '../versions'
import { seedFiles } from './seedFiles'
import { taskConfigure } from './taskConfigure'
import { taskSelectNode } from './taskSelectNode'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  taskSelectNode,
  taskConfigure,
)

export const uninit = sdk.setupUninit(versionGraph)
