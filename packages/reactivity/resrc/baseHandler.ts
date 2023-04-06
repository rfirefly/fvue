import { isObject } from '@fvue/shared'
import { track, trigger } from './effect'
import { reactive, readonly } from './reactive'

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

function createGetter(isReadonly = false, isShadow = false) {
  return function (target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE)
      return !isReadonly
    else if (key === ReactiveFlags.IS_READONLY)
      return isReadonly

    const res = Reflect.get(target, key, receiver)

    if (isShadow)
      return res

    if (isObject(res))
      return isReadonly ? readonly(res) : reactive(res)

    if (!isReadonly)
      track(target, 'get', key)

    return res
  }
}

function createSetter() {
  return function (target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, 'set', key)
    return res
  }
}

const get = createGetter()
const set = createSetter()
export const mutableHandlers = {
  get,
  set,
}
const readonlyGet = createGetter(true)
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value, receiver) {
    console.warn(`set ${key} failed, target: ${target} is readonly`)
    return true
  },
}

const shadowReadonlyGet = createGetter(true, true)
export const shadowReadonlyHandlers = {
  get: shadowReadonlyGet,
  set(target, key, value, receiver) {
    console.warn(`set ${key} failed, target: ${target} is readonly`)
    return true
  },
}
