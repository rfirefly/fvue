import { isObject } from '@fvue/shared'
import { ReactiveFlags, mutableHandlers, readonlyHandlers, shadowReadonlyHandlers } from './baseHandler'

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}

function createReactiveObject(target: object, handler: ProxyHandler<any>) {
  if (!isObject(target))
    return
  return new Proxy(target, handler)
}
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers)
}

export function isReadonly(target: object) {
  return !!(target && target[ReactiveFlags.IS_READONLY])
}
export function readonly(target) {
  return createReactiveObject(target, readonlyHandlers)
}
export function shadowReadonly(target) {
  return createReactiveObject(target, shadowReadonlyHandlers)
}

export function isProxy(target: object) {
  return isReactive(target) || isReadonly(target)
}
