import { isFunction } from '@fvue/shared'
import { ReactiveEffect, trackEffect, triggerEffect } from './effect'

class ComputedImpl {
  private _dirty = true
  private _value
  public __v_isReadonly = true
  public __v_isRef = true
  private _effect
  private _dep = new Set()
  constructor(private _getter, private _setter) {
    this._effect = new ReactiveEffect(_getter, () => {
      if (!this._dirty) {
        this._dirty = true
        triggerEffect(this._dep)
      }
    })
  }

  get value() {
    trackEffect(this._dep)

    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }

  set value(value: any) {
    this._value = this._setter(value)
  }
}

export function computed(getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)
  let getter
  let setter
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => console.warn('no setter')
  }
  else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedImpl(getter, setter)
}
