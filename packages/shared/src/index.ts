export function isObject(val: any) {
  return typeof val === 'object' && val !== null
}
export function isFunction(val: any) {
  return typeof val === 'function'
}

export const isArray = Array.isArray

export function isString(val) {
  return typeof val === 'string'
}

export function isNumber(val) {
  return typeof val === 'number'
}

const hasOwnProperty = Object.prototype.hasOwnProperty
const ArrayIncludes = Array.prototype.includes
export function hasOwn(value, key) {
  return hasOwnProperty.call(value, key)
}
export function hasInclude(value, key) {
  return ArrayIncludes.call(value, key)
}

export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1,
  STATEFUL_COMPONENT = 1 << 2,
  TEXT_CHILDREN = 1 << 3,
  ARRENT_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEEP_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT,
}

export function invokeFns(fns) {
  for (let i = 0; i < fns.length; i++)
    fns[i]()
}

export const enum NodeTypes {
  TEXT = 'TEXT',
  INTERPOLATION = 'INTERPOLATION',
  SIMPLE_EXPRESSION = 'SIMPLE_EXPRESSION',
  ELEMENT = 'ELEMENT',
  ATTRIBUTE = 'ATTRIBUTE',
  ROOT = 'ROOT',
  COMPOUND_EXPRESSION = 'COMPOUND_EXPRESSION',
}

export const extend = Object.assign

export function hasChanged(value: any, oldValue: any): boolean {
  return !Object.is(value, oldValue)
}
