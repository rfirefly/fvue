import { hasChanged, isArray, isObject } from '@fvue/shared'
import { trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

function toReactive(val) {
  return isObject(val) ? reactive(val) : val
}

class RefImpl {
  private _value: any
  private _rawValue
  private _dep = new Set()
  public __v_isRef = true

  constructor(val) {
    this._setValue(val)
  }

  private _setValue(val) {
    this._rawValue = val
    this._value = toReactive(val)
  }

  get value() {
    trackEffect(this._dep)
    return this._value
  }

  set value(newVal) {
    if (!hasChanged(this._rawValue, newVal))
      return

    this._setValue(newVal)
    triggerEffect(this._dep)
  }
}

export function ref(val) {
  return new RefImpl(val)
}

export function isRef(val) {
  return !!val.__v_isRef
}

export function unRef(val) {
  return isRef(val) ? val.value : val
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key, receiver) {
      return unRef(Reflect.get(target, key, receiver))
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

class ObjectRefImpl {
  constructor(private target, private key) {}

  get value() {
    return this.target[this.key]
  }

  set value(newVal) {
    this.target[this.key] = newVal
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
