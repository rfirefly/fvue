import { isObject } from '@FVue/shared'
import { ReactiveFlags, mutableHandlers } from './baseHandler'

export function isReactive(target) {
  return !!(target && target[ReactiveFlags.IS_REACTIVE])
}

const reactiveMap = new WeakMap()
export function reactive(target: object) {
  if (!isObject(target))
    return

  //   已代理过的对象，直接返回缓存的代理对象
  const existProxy = reactiveMap.get(target)
  if (existProxy)
    return existProxy
  // 若传入以代理过的对象，直接返回
  if (target[ReactiveFlags.IS_REACTIVE])
    return target
  //   对对象进行代理
  const proxy = new Proxy(target, mutableHandlers)
  //   缓存代理对象
  reactiveMap.set(target, proxy)
  return proxy
}
