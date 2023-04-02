import { track, trigger } from './effect'

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)

      track(target, 'get', key)
      return res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, 'set', key)
      return res
    },
  })
}