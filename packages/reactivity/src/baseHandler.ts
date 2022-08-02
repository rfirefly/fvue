import { isObject } from '@FVue/shared'
import { track, trigget } from './effect'
import { reactive } from './reactive'

export const enum ReactiveFlags {
  IS_REACTIVE = '__is_reactive',
}

export const mutableHandlers = {
  get(target, key, receiver) {
    // 判断传入对象是否代理过
    if (key === ReactiveFlags.IS_REACTIVE) return true
    // 依赖收集
    track(target, 'get', key)
    // 处理 getter this 指向，保证所有属性被代理
    let res = Reflect.get(target, key, receiver)
    if (isObject(res)) return reactive(res)
    return res
  },
  set(target, key, value, receiver) {
    const oldValue = target[key]
    // 处理 setter this 指向，保证所有属性被代理
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigget(target, 'set', key, value, oldValue)
    }

    return result
  },
}
