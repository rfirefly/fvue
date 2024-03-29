import { isArray, isObject } from '@fvue/shared'
import { trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

function toReactive(val) {
  return isObject(val) ? reactive(val) : val
}

class RefImpl {
  public _value
  public _dep = new Set()
  public __v_isRef = true
  constructor(public rawVal) {
    this._value = toReactive(rawVal)
  }

  get value() {
    trackEffect(this._dep)
    return this._value
  }

  set value(newVal) {
    if (newVal !== this.rawVal) {
      this._value = toReactive(newVal)
      this.rawVal = newVal
      triggerEffect(this._dep)
    }
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(val) {
  return !!val.__v_isRef
}

export function unRef(val) {
  return isRef(val) ? val.value : val
}

class ObjectRefImpl {
  constructor(public target, public key) {}
  get value() {
    return this.target[this.key]
  }

  set value(value) {
    this.target[this.key] = value
  }
}

export function toRef(target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs(obj) {
  const res = isArray(obj) ? new Array(obj.length) : {}
  for (const key in res)
    res[key] = toRef(obj, key)

  return res
}

export function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)

      return unRef(res)
    },
    set(target, key, newValue, receiver) {
      if (isRef(target[key]) && !isRef(newValue)) {
        target[key].value = newValue
        return true
      } else {
        return Reflect.set(target, key, newValue, receiver)
      }
    },
  })
}
