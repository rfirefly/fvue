import { isNumber, isString } from '@FVue/shared'
import { createVnode } from './vnode'
import { Text } from './vnode'

export const normalize = child => {
  // 处理文本节点
  if (isString(child) || isNumber(child)) {
    return createVnode(Text, null, child)
  }
  if (child === null || child === undefined) {
    return createVnode(Text, null, '')
  }
  return child
}
