import { isNumber, isString } from '@fvue/shared'
import { Text, createVnode } from './vnode'

export function normalize(child) {
  // 处理文本节点
  if (isString(child) || isNumber(child))
    return createVnode(Text, null, child)

  if (child === null || child === undefined)
    return createVnode(Text, null, '')

  return child
}
