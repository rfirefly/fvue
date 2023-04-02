import { createRenderer } from '@FVue/runtime-core'
import { isString } from '@FVue/shared'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

const renderOptions = Object.assign(nodeOps, { patchProp })

export function render(vnode, containder) {
  if (isString(containder))
    containder = document.querySelector(containder)

  createRenderer(renderOptions).render(vnode, containder)
}

export * from '@FVue/runtime-core'
