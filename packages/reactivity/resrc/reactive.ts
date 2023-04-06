import { ReactiveFlags, mutableHandlers, readonlyHandlers, shadowReadonlyHandlers } from './baseHandler'

function createReactiveObject(target: object, handler: ProxyHandler<any>) {
  return new Proxy(target, handler)
}

export function isReactive(target: object) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
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
