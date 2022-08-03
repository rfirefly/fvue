import { isArray, isObject } from '@FVue/shared'
import { createVnode, isVnode } from './vnode'

export function h(type, propsOrChildren = null, children?) {
  const len = arguments.length
  if (len === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren])
      }
      return createVnode(type, propsOrChildren)
    }
    return createVnode(type, null, propsOrChildren)
  }

  if (len === 3 && isVnode(children)) {
    children = [children]
  }

  if (len > 3) {
    children = Array.from(arguments).slice(2)
  }

  return createVnode(type, propsOrChildren, children)
}
