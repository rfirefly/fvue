import {
  ShapeFlags,
  isArray,
  isFunction,
  isObject,
  isString,
} from '@FVue/shared'
import { isTeleport } from './components/Teleport'

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function isVnode(node: any): boolean {
  return !!(node && node.__v_isVnode)
}

export function isSameNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

let currentBlock = []
export function createVnode(type, props, children = null, patchFlag = 0) {
  let shapeFlag = 0
  if (isString(type))
    shapeFlag = ShapeFlags.ELEMENT
  if (isTeleport(type))
    shapeFlag = ShapeFlags.TELEPORT
  if (isFunction(type))
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
  if (isObject(type))
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  const vnode = {
    type,
    props,
    children,
    el: null,
    key: props?.key,
    __v_isVnode: true,
    shapeFlag,
    patchFlag,
  }

  if (children !== null) {
    let type = 0
    if (isArray(children)) {
      type = ShapeFlags.ARRENT_CHILDREN
    }
    else if (isObject(children)) {
      type = ShapeFlags.SLOTS_CHILDREN
    }
    else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }

  if (currentBlock && vnode.patchFlag)
    currentBlock.push(vnode)

  return vnode
}

export function openBlock() {
  currentBlock = []
}

export function createElementBlock(type, props, children, patchFlag) {
  return setupBlock(createVnode(type, props, children, patchFlag))
}

export function setupBlock(vnode) {
  vnode.dynamicChildren = currentBlock
  currentBlock = null
  return vnode
}
export function toDisplayString(val) {
  return isString(val)
    ? val
    : val === null
      ? ''
      : isObject(val)
        ? JSON.stringify(val)
        : String(val)
}

export { createVnode as createElementVNode }
